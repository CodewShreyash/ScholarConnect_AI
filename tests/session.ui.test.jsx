import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,cleanup,act} from '@testing-library/react';
import {AuthProvider,useAuth} from '../src/context/AuthContext';
const mock=vi.hoisted(()=>({callback:null,getSession:vi.fn(),single:vi.fn(),unsubscribe:vi.fn()}));
vi.mock('../src/lib/supabase',()=>{
 const fake={auth:{onAuthStateChange:cb=>{mock.callback=cb;return{data:{subscription:{unsubscribe:mock.unsubscribe}}};},getSession:mock.getSession},from:()=>({select:()=>({eq:()=>({single:mock.single})})})};
 return {supabase:fake,client:()=>fake,unwrap:({data,error})=>{if(error)throw error;return data;}};
});
function Consumer(){const a=useAuth();return <p>{a.loading?'Loading':a.user?(a.profile?.role||a.error):'Signed out'}</p>;}
afterEach(cleanup);
beforeEach(()=>{vi.clearAllMocks();mock.getSession.mockResolvedValue({data:{session:{user:{id:'student'}}},error:null});mock.single.mockResolvedValue({data:{id:'student',role:'student'},error:null});});
it('restores a persisted session and reacts to cross-tab sign-out',async()=>{
 render(<AuthProvider><Consumer/></AuthProvider>);await screen.findByText('student');act(()=>mock.callback('SIGNED_OUT',null));await screen.findByText('Signed out');
});
it('unsubscribes its auth listener on unmount',async()=>{
 const result=render(<AuthProvider><Consumer/></AuthProvider>);await screen.findByText('student');result.unmount();expect(mock.unsubscribe).toHaveBeenCalledTimes(1);
});
