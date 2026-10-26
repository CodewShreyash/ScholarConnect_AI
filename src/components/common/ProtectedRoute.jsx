import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Feedback from './Feedback';
export default function ProtectedRoute({role,children}) {
 const {user,profile,loading,error,retry,signOut}=useAuth(),location=useLocation();
 if(loading)return <Feedback loading/>;
 if(!user)return <Navigate to="/login" replace state={{from:location.pathname}}/>;
 if(error)return <main className="p-8"><Feedback error={error}/><button onClick={retry}>Retry</button> <button onClick={()=>signOut().catch(()=>{})}>Sign out</button></main>;
 if(!profile)return <Feedback error="Your account profile is missing. Contact the project administrator."/>;
 if(role&&profile.role!==role)return <Navigate to="/dashboard" replace/>;
 return children;
}
