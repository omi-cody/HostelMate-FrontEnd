// This page is now handled by HostelProfile.tsx which combines KYC + profile editing.
// This file redirects to keep any old links working.
import { Navigate } from 'react-router-dom';
export default function HostelKyc() { return <Navigate to="/hostel/profile" replace />; }
