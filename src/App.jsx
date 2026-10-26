import {BrowserRouter,Routes,Route,Navigate,Link} from 'react-router-dom';
import {AuthProvider,useAuth} from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/public/Home';
import Scholarships from './pages/public/Scholarships';
import ScholarshipDetails from './pages/public/ScholarshipDetails';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Recovery,{AuthCallback} from './pages/auth/Recovery';
import ProfileSetup from './pages/student/ProfileSetup';
import StudentDashboard from './pages/student/Dashboard';
import Documents from './pages/student/Documents';
import Passport from './pages/student/Passport';
import OpportunityRescue from './pages/student/OpportunityRescue';
import Applications from './pages/Applications';
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderProfile from './pages/provider/Profile';
import ScholarshipEditor from './pages/provider/ScholarshipEditor';
import {configured} from './lib/supabase';
import {PreferencesProvider} from './context/PreferencesContext';
function Dashboard(){const {profile}=useAuth();return <Navigate replace to={profile.role==='provider'?'/provider/dashboard':'/student/dashboard'}/>;}
const protect=(role,element)=><ProtectedRoute role={role}>{element}</ProtectedRoute>;
export default function App(){return <BrowserRouter><AuthProvider><PreferencesProvider>{!configured&&<div role="alert" className="bg-amber-50 border-b border-amber-200 text-amber-900 px-6 py-3 text-sm">Supabase setup required. Add the project URL and publishable key to .env.local, then restart the app. See README.md.</div>}<Routes>
<Route path="/" element={<Home/>}/><Route path="/scholarships" element={<Scholarships/>}/><Route path="/scholarships/:id" element={<ScholarshipDetails/>}/>
<Route path="/register" element={<Register/>}/><Route path="/login" element={<Login/>}/><Route path="/auth/callback" element={<AuthCallback/>}/><Route path="/reset-password" element={<Recovery/>}/>
<Route path="/dashboard" element={protect(null,<Dashboard/>)}/><Route path="/student/dashboard" element={protect('student',<StudentDashboard/>)}/><Route path="/student/profile-setup" element={protect('student',<ProfileSetup/>)}/><Route path="/student/documents" element={protect('student',<Documents/>)}/><Route path="/student/passport" element={protect('student',<Passport/>)}/><Route path="/student/rescue" element={protect('student',<OpportunityRescue/>)}/><Route path="/student/applications" element={protect('student',<Applications/>)}/>
<Route path="/provider/dashboard" element={protect('provider',<ProviderDashboard/>)}/><Route path="/provider/profile" element={protect('provider',<ProviderProfile/>)}/><Route path="/provider/scholarships/new" element={protect('provider',<ScholarshipEditor/>)}/><Route path="/provider/scholarships/:id/edit" element={protect('provider',<ScholarshipEditor/>)}/><Route path="/provider/applications" element={protect('provider',<Applications/>)}/><Route path="*" element={<main className="p-10"><h1 className="text-2xl font-bold">Page not found</h1><Link to="/">Back to home</Link></main>}/>
</Routes></PreferencesProvider></AuthProvider></BrowserRouter>;}
