import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useResource } from '../../lib/useResource';
import { documentKinds, listDocuments, uploadDocument, deleteDocument, documentUrl } from '../../lib/api';
import { documentKindDescriptions } from '../../lib/documentTypes';
import { latestDocumentsByKind } from '../../lib/featureEngine';
import { errorMessage } from '../../lib/supabase';
import AccountLayout, { cardClass, inputClass, buttonClass } from '../../components/layout/AccountLayout';
import Feedback from '../../components/common/Feedback';

export default function Documents() {
  const { user } = useAuth();
  const [busyKind, setBusyKind] = useState('');
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');
  const { data, error, loading, reload } = useResource(() => listDocuments(user.id), [user.id]);
  const documentsByKind = latestDocumentsByKind(data || []);

  const upload = async (kind, event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.namedItem('file').files?.[0];
    if (!file) return;
    setBusyKind(kind);
    setActionError('');
    setMessage('');
    try {
      await uploadDocument(user.id, kind, file);
      form.reset();
      await reload();
      setMessage(`${kind} uploaded successfully.`);
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyKind('');
    }
  };

  const remove = async doc => {
    if (!window.confirm('Delete this document from your vault?')) return;
    setBusyKind(doc.kind);
    setActionError('');
    try {
      await deleteDocument(doc);
      await reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusyKind('');
    }
  };

  const view = async doc => {
    try {
      const url = await documentUrl(doc.path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setActionError(errorMessage(err));
    }
  };

  return (
    <AccountLayout title="Document Vault">
      <p className="mb-6 text-slate-600">
        Upload each document from its own card below. PDF, JPG or PNG files up to 10 MB are accepted.
        ScholarShield checks your vault against each scholarship’s required-document list before
        submission. Only documents you submit with an application are shared with its provider.
      </p>
      <Feedback loading={loading} error={actionError || error} message={message} />
      {error && <button onClick={reload}>Retry</button>}

      <section aria-labelledby="document-upload-heading" className="mb-8">
        <div className="mb-4">
          <h2 id="document-upload-heading" className="text-xl font-black text-[#10162f]">Upload your documents</h2>
          <p className="mt-1 text-sm text-slate-500">10 separate upload options — choose a file and upload it from the matching document card.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {documentKinds.map((kind, index) => {
            const uploaded = documentsByKind.get(kind);
            const busy = busyKind === kind;
            return (
              <form
                key={kind}
                onSubmit={event => upload(kind, event)}
                className={`${cardClass} flex h-full flex-col`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-[#315e4d]">
                      Document {index + 1} of {documentKinds.length}
                    </p>
                    <h3 className="mt-1 font-black text-[#10162f]">{kind}</h3>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                    uploaded ? 'bg-[#e5f6f1] text-[#147d69]' : 'bg-[#fff3da] text-[#9a6714]'
                  }`}>
                    {uploaded ? 'UPLOADED' : 'NOT UPLOADED'}
                  </span>
                </div>
                <p className="mb-4 min-h-10 text-xs leading-5 text-slate-500">
                  {documentKindDescriptions[kind]}
                </p>
                {uploaded && (
                  <p className="mb-3 truncate text-xs font-semibold text-[#596579]" title={uploaded.name}>
                    Current file: {uploaded.name}
                  </p>
                )}
                <label className="mt-auto block text-xs font-bold text-[#3d4659]">
                  Choose {kind}
                  <input
                    aria-label={`Upload ${kind}`}
                    name="file"
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={`${inputClass} mt-2 text-xs`}
                  />
                </label>
                <button type="submit" disabled={Boolean(busyKind)} className={`${buttonClass} mt-3 w-full`}>
                  {busy ? 'Uploading…' : uploaded ? 'Replace document' : 'Upload document'}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="uploaded-documents-heading">
        <h2 id="uploaded-documents-heading" className="mb-4 text-xl font-black text-[#10162f]">Uploaded files</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map(doc => (
            <div key={doc.id} className={cardClass}>
              <h3 className="font-bold">{doc.kind}</h3>
              <p className="mt-2 break-all text-slate-600">{doc.name}</p>
              <p className="mt-1 text-xs text-slate-400">
                {new Date(doc.created_at).toLocaleString()} · {(doc.size_bytes / 1024).toFixed(0)} KB
              </p>
              <div className="mt-4 flex gap-6">
                <button type="button" className="font-semibold text-[#5151c7]" onClick={() => view(doc)}>Open</button>
                <button type="button" disabled={Boolean(busyKind)} className="text-red-700" onClick={() => remove(doc)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        {data?.length === 0 && <p className="text-sm text-slate-500">No documents uploaded yet.</p>}
      </section>
    </AccountLayout>
  );
}
