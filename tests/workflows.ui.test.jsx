import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
import {render,screen,waitFor,cleanup,fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import Login from '../src/pages/auth/Login';
import Register from '../src/pages/auth/Register';
import ProtectedRoute from '../src/components/common/ProtectedRoute';
import ScholarshipDetails from '../src/pages/public/ScholarshipDetails';
import ProfileSetup from '../src/pages/student/ProfileSetup';
import Documents from '../src/pages/student/Documents';
import {PreferencesProvider} from '../src/context/PreferencesContext';
const mocks=vi.hoisted(()=>({auth:{user:null,profile:null,loading:false,error:'',retry:vi.fn(),signOut:vi.fn()},signIn:vi.fn(),signUp:vi.fn(),reset:vi.fn(),apply:vi.fn(),details:vi.fn(),documents:vi.fn(),student:vi.fn(),saveStudent:vi.fn(),uploadDocument:vi.fn(),deleteDocument:vi.fn(),documentUrl:vi.fn(),validateFile:vi.fn(),profileToForm:vi.fn(()=>({})),isStudentProfileComplete:vi.fn(profile=>Boolean(profile?.complete))}));
vi.mock('../src/context/AuthContext',()=>({useAuth:()=>mocks.auth}));
vi.mock('../src/lib/supabase',()=>({client:()=>({auth:{signInWithPassword:mocks.signIn,signUp:mocks.signUp,resetPasswordForEmail:mocks.reset}}),unwrap:({data,error})=>{if(error)throw error;return data;},errorMessage:e=>e.message}));
vi.mock('../src/lib/api',()=>({documentKinds:['Category Certificate','Income Certificate','Marksheet','Admission Proof','Identity Proof','Bank Details','Domicile Document','Gap Certificate','Ration Card','Passport-size Photograph'],getScholarship:mocks.details,listDocuments:mocks.documents,loadStudent:mocks.student,saveStudent:mocks.saveStudent,profileToForm:mocks.profileToForm,isStudentProfileComplete:mocks.isStudentProfileComplete,uploadDocument:mocks.uploadDocument,deleteDocument:mocks.deleteDocument,documentUrl:mocks.documentUrl,validateFile:mocks.validateFile,apply:mocks.apply}));
afterEach(cleanup);
beforeEach(()=>{vi.clearAllMocks();mocks.auth.user=null;mocks.auth.profile=null;mocks.auth.loading=false;mocks.student.mockResolvedValue({full_name:'Test Student',date_of_birth:'2004-01-01',gender:'',state:'',district:'',education_level:'Undergraduate',course:'',year_of_study:'',institution:'Test College',percentage:75,category:'Scheduled Tribe',family_income:300000,domicile_state:'Maharashtra'});});
function route(element,path='/'){return render(<PreferencesProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/" element={element}/><Route path="/login" element={<div>LOGIN DESTINATION</div>}/><Route path="/dashboard" element={<div>DASHBOARD DESTINATION</div>}/><Route path="/student/applications" element={<div>APPLICATION DESTINATION</div>}/><Route path="/scholarships/:id" element={element}/></Routes></MemoryRouter></PreferencesProvider>);}
describe('authentication and guards',()=>{
 it('submits email and password and navigates only after successful login',async()=>{
  mocks.signIn.mockResolvedValue({data:{session:{}},error:null});const user=userEvent.setup();route(<Login/>);
  await user.type(screen.getByPlaceholderText('you@example.com'),'student@example.com');await user.type(screen.getByPlaceholderText('Enter your password'),'valid-password');await user.click(screen.getByRole('button',{name:/Sign in/i}));
  await screen.findByText('DASHBOARD DESTINATION');expect(mocks.signIn).toHaveBeenCalledWith({email:'student@example.com',password:'valid-password'});
 });
 it('surfaces authentication errors without navigating',async()=>{
  mocks.signIn.mockResolvedValue({data:null,error:{message:'Invalid login credentials'}});const user=userEvent.setup();route(<Login/>);
  await user.type(screen.getByPlaceholderText('you@example.com'),'student@example.com');await user.type(screen.getByPlaceholderText('Enter your password'),'wrong-password');await user.click(screen.getByRole('button',{name:/Sign in/i}));
  expect((await screen.findByRole('alert')).textContent).toContain('Invalid login credentials');expect(screen.queryByText('DASHBOARD DESTINATION')).toBeNull();
 });
 it('requires confirmation after provider signup and sends provider metadata',async()=>{
  mocks.signUp.mockResolvedValue({data:{session:null,user:{}},error:null});const user=userEvent.setup();route(<Register/>);
  await user.click(screen.getByRole('button',{name:/Scholarship provider/i}));await user.type(screen.getByPlaceholderText('Enter full name'),'Provider Contact');await user.type(screen.getByPlaceholderText('NGO, CSR, foundation or institution'),'Test Foundation');await user.type(screen.getByPlaceholderText('you@example.com'),'provider@example.com');const phoneInput=screen.getByRole('textbox',{name:'10-digit Indian mobile number'});await user.type(phoneInput,'987654321098');expect(phoneInput.value).toBe('9876543210');await user.type(screen.getByPlaceholderText('At least 10 characters'),'valid-password');await user.click(screen.getByRole('checkbox'));await user.click(screen.getByRole('button',{name:/Create provider account/i}));
  await screen.findByText(/Check your email to confirm/);expect(mocks.signUp.mock.calls[0][0].options.data).toMatchObject({role:'provider',organization_name:'Test Foundation',phone:'+919876543210'});expect(screen.queryByText('DASHBOARD DESTINATION')).toBeNull();
 });
 it('lets students choose a non-ST category and return to the dashboard from profile setup',async()=>{
  mocks.auth.user={id:'student'};mocks.student.mockResolvedValue({category:''});mocks.documents.mockResolvedValue([]);const user=userEvent.setup();route(<ProfileSetup/>);
  expect(screen.getByRole('link',{name:/Back to dashboard/i}).getAttribute('href')).toBe('/student/dashboard');
  await user.click(screen.getByRole('button',{name:'Continue'}));await user.click(screen.getByRole('button',{name:'Continue'}));
  const category=screen.getByRole('combobox');expect(category.value).toBe('');expect([...category.options].map(option=>option.value)).toContain('OBC');
  await user.selectOptions(category,'OBC');expect(category.value).toBe('OBC');
 });
 it('shows an edit action instead of complete after a student profile is already complete',async()=>{
  mocks.auth.user={id:'student'};mocks.student.mockResolvedValue({complete:true});mocks.documents.mockResolvedValue([]);
  mocks.profileToForm.mockReturnValue({fullName:'Test Student',educationLevel:'Undergraduate',domicileState:'Maharashtra',category:'OBC',percentage:'75',familyIncome:'250000'});
  const user=userEvent.setup();route(<ProfileSetup/>);
  await screen.findByText('Edit your scholarship profile');
  for(let step=1;step<5;step++) await user.click(screen.getByRole('button',{name:'Continue'}));
  expect(screen.getByRole('button',{name:'Save profile changes'})).toBeTruthy();
 });
 it('redirects signed-out users and blocks the wrong account role',async()=>{
  route(<ProtectedRoute role="provider"><div>PRIVATE CONTENT</div></ProtectedRoute>);await screen.findByText('LOGIN DESTINATION');expect(screen.queryByText('PRIVATE CONTENT')).toBeNull();cleanup();
  mocks.auth.user={id:'student'};mocks.auth.profile={role:'student'};route(<ProtectedRoute role="provider"><div>PRIVATE CONTENT</div></ProtectedRoute>);await screen.findByText('DASHBOARD DESTINATION');expect(screen.queryByText('PRIVATE CONTENT')).toBeNull();
 });
});
describe('scholarship submission screen',()=>{
 const scholarship={id:'scholarship',displayName:'Test Scholarship',officialName:'Test',provider:'Foundation',providerType:'NGO',educationLevel:'Undergraduate',location:'India',deadline:'Tomorrow',amount:'₹20,000',stream:'All',description:'Test',match:100,eligible:true,reasons:['Rules met'],eligibility:[],requiredDocuments:['Marksheet'],verified:false};
 it('loads actual document readiness and submits selected data before navigation',async()=>{
  mocks.auth.user={id:'student'};mocks.auth.profile={id:'student',role:'student'};mocks.details.mockResolvedValue(scholarship);mocks.documents.mockResolvedValue([{id:'document',kind:'Marksheet'}]);mocks.apply.mockResolvedValue('application');const user=userEvent.setup();route(<ScholarshipDetails/>,'/scholarships/scholarship');
  await screen.findByText('100% Ready');await user.click(screen.getByRole('button',{name:'Apply Now'}));await screen.findByText('APPLICATION DESTINATION');expect(mocks.apply).toHaveBeenCalledWith(scholarship,[{id:'document',kind:'Marksheet'}]);
 });
 describe('document vault upload options',()=>{
  it('shows ten separate document upload controls and uploads using the selected card type',async()=>{
   mocks.auth.user={id:'student'};mocks.documents.mockResolvedValue([]);mocks.uploadDocument.mockResolvedValue({id:'uploaded'});
   const user=userEvent.setup();route(<Documents/>);
   const uploadInputs=await screen.findAllByLabelText(/^Upload (Category|Income|Marksheet|Admission|Identity|Bank|Domicile|Gap|Ration|Passport)/);
   expect(uploadInputs).toHaveLength(10);
   const identityInput=screen.getByLabelText('Upload Identity Proof');
   const file=new File(['identity'], 'aadhaar.pdf', {type:'application/pdf'});
   await user.upload(identityInput,file);
   expect(identityInput.files[0]).toBe(file);
   fireEvent.submit(identityInput.closest('form'));
   await waitFor(()=>expect(mocks.uploadDocument).toHaveBeenCalledWith('student','Identity Proof',file));
  });
 });
 it('does not pretend that failed submission succeeded',async()=>{
  mocks.auth.user={id:'student'};mocks.auth.profile={id:'student',role:'student'};mocks.details.mockResolvedValue(scholarship);mocks.documents.mockResolvedValue([{id:'document',kind:'Marksheet'}]);mocks.apply.mockRejectedValue(new Error('Deadline has passed'));const user=userEvent.setup();route(<ScholarshipDetails/>,'/scholarships/scholarship');await user.click(await screen.findByRole('button',{name:'Apply Now'}));await screen.findByText('Deadline has passed');expect(screen.queryByText('APPLICATION DESTINATION')).toBeNull();
 });
 it('prevents UI submission for an ineligible student',async()=>{
  mocks.auth.user={id:'student'};mocks.auth.profile={id:'student',role:'student'};mocks.details.mockResolvedValue({...scholarship,eligible:false,match:80,reasons:['Income exceeds limit']});mocks.documents.mockResolvedValue([{id:'document',kind:'Marksheet'}]);route(<ScholarshipDetails/>,'/scholarships/scholarship');expect((await screen.findByRole('button',{name:'Apply Now'})).disabled).toBe(true);expect(mocks.apply).not.toHaveBeenCalled();
 });
});
