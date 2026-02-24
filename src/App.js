import './App.css';
import './styles/global.css';
import { ToastContainer,toast } from 'react-toastify';  
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HostelRegistration from './pages/HostelRegistration';
import StudentRegistration from './pages/StudentRegistration';
import StudentKyc from './pages/StudentKyc';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import TestConnection from './pages/test.jsx';


function App() {
  return (

    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register-student" element={<StudentRegistration />} />
        <Route path="/register-hostel" element={<HostelRegistration />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/student-kyc" element={<StudentKyc />} />
        <Route path="/test-connection" element={<TestConnection />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>

  );
}

export default App;
