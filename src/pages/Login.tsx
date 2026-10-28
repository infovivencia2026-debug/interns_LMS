import { Navigate } from "react-router-dom";

// The onrol.in community portal (Supabase-backed) has been retired. Any hit
// to /login now bounces to the homepage. Kept as a route so old links resolve.
export default function Login() {
  return <Navigate to="/" replace />;
}
