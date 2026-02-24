import { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, FileText, User, Mail, Phone, MapPin, Calendar, School, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { toast } from 'react-toastify';

export default function StudentVerifications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [actionStudentId, setActionStudentId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const students = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+977 9812345678',
      gender: 'Male',
      dob: '2000-05-15',
      levelOfStudy: 'Bachelor',
      course: 'Computer Science',
      instituteName: 'Tribhuvan University',
      instituteAddress: 'Kirtipur, Kathmandu',
      province: 'Bagmati',
      district: 'Kathmandu',
      municipality: 'Kirtipur Municipality',
      tole: 'Nayabazar',
      wardNo: '5',
      guardianName: 'Robert Doe',
      guardianPhone: '+977 9823456789',
      guardianRelation: 'Father',
      documentType: 'Citizenship',
      documentNumber: '123456789',
      documentImage: 'https://via.placeholder.com/150',
      profilePicture: 'https://via.placeholder.com/150',
      submittedDate: '2024-12-20',
      status: 'Pending',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+977 9823456789',
      gender: 'Female',
      dob: '2001-08-22',
      levelOfStudy: 'Master',
      course: 'Business Administration',
      instituteName: 'Kathmandu University',
      instituteAddress: 'Dhulikhel, Kavre',
      province: 'Bagmati',
      district: 'Kavre',
      municipality: 'Dhulikhel Municipality',
      tole: 'Banepa Road',
      wardNo: '3',
      guardianName: 'Mary Smith',
      guardianPhone: '+977 9834567890',
      guardianRelation: 'Mother',
      documentType: 'Citizenship',
      documentNumber: '987654321',
      documentImage: 'https://via.placeholder.com/150',
      profilePicture: 'https://via.placeholder.com/150',
      submittedDate: '2024-12-21',
      status: 'Pending',
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      phone: '+977 9845678901',
      gender: 'Male',
      dob: '1999-12-10',
      levelOfStudy: 'Bachelor',
      course: 'Engineering',
      instituteName: 'Pulchowk Campus',
      instituteAddress: 'Pulchowk, Lalitpur',
      province: 'Bagmati',
      district: 'Lalitpur',
      municipality: 'Lalitpur Metropolitan',
      tole: 'Pulchowk',
      wardNo: '7',
      guardianName: 'James Brown',
      guardianPhone: '+977 9856789012',
      guardianRelation: 'Father',
      documentType: 'Citizenship',
      documentNumber: '1122334455',
      documentImage: 'https://via.placeholder.com/150',
      profilePicture: 'https://via.placeholder.com/150',
      submittedDate: '2024-12-22',
      status: 'Pending',
    },
    // Add more mock students for pagination demo
    ...Array.from({ length: 15 }, (_, i) => ({
      id: i + 4,
      name: `Student ${i + 4}`,
      email: `student${i + 4}@example.com`,
      phone: `+977 98${10000000 + i}`,
      gender: i % 2 === 0 ? 'Male' : 'Female',
      dob: '2000-01-01',
      levelOfStudy: 'Bachelor',
      course: 'Various',
      instituteName: 'University',
      instituteAddress: 'Kathmandu',
      province: 'Bagmati',
      district: 'Kathmandu',
      municipality: 'Kathmandu',
      tole: 'Area',
      wardNo: '1',
      guardianName: 'Guardian Name',
      guardianPhone: '+977 9800000000',
      guardianRelation: 'Parent',
      documentType: 'Citizenship',
      documentNumber: '123456789',
      documentImage: 'https://via.placeholder.com/150',
      profilePicture: 'https://via.placeholder.com/150',
      submittedDate: '2024-12-20',
      status: 'Pending',
    })),
  ];

  const handleVerify = (id) => {
    setActionStudentId(id);
    setShowVerifyDialog(true);
  };

  const confirmVerify = () => {
    if (actionStudentId) {
      const student = students.find(s => s.id === actionStudentId);
      toast.success('Student verified successfully!', {
        description: `${student?.name} has been approved and can now proceed with hostel applications.`,
        duration: 4000,
      });
      setSelectedStudent(null);
      setShowVerifyDialog(false);
      setActionStudentId(null);
    }
  };

  const handleReject = (id) => {
    setActionStudentId(id);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (actionStudentId) {
      const student = students.find(s => s.id === actionStudentId);
      toast.error('Student application rejected', {
        description: `${student?.name}'s KYC application has been rejected.`,
        duration: 4000,
      });
      setSelectedStudent(null);
      setShowRejectDialog(false);
      setActionStudentId(null);
    }
  };

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-1 text-cyan-400">Student Verifications</h2>
        <p className="text-white">Review and verify student KYC applications</p>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Pending</p>
          <p className="text-2xl text-orange-600">{students.filter(s => s.status === 'Pending').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Verified</p>
          <p className="text-2xl text-green-600">{students.filter(s => s.status === 'Verified').length}</p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm">ID</th>
                <th className="px-6 py-3 text-left text-sm">Name</th>
                <th className="px-6 py-3 text-left text-sm">Contact</th>
                <th className="px-6 py-3 text-left text-sm">Institution</th>
                <th className="px-6 py-3 text-left text-sm">Submitted</th>
                <th className="px-6 py-3 text-left text-sm">Status</th>
                <th className="px-6 py-3 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">#{student.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{student.phone}</td>
                  <td className="px-6 py-4 text-sm">{student.instituteName}</td>
                  <td className="px-6 py-4 text-sm">{student.submittedDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs rounded-lg ${
                      student.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                      student.status === 'Verified' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-600 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-cyan-400 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl">Student KYC Details</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg mb-4 pb-2 border-b border-gray-200">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedStudent.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium">{selectedStudent.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">{selectedStudent.dob}</p>
                  </div>
                </div>
              </div>

              {/* Education Details */}
              <div>
                <h4 className="text-lg mb-4 pb-2 border-b border-gray-200">Education Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Level of Study</p>
                    <p className="font-medium">{selectedStudent.levelOfStudy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Course</p>
                    <p className="font-medium">{selectedStudent.course}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Institute Name</p>
                    <p className="font-medium">{selectedStudent.instituteName}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Institute Address</p>
                    <p className="font-medium">{selectedStudent.instituteAddress}</p>
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div>
                <h4 className="text-lg mb-4 pb-2 border-b border-gray-200">Address Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Province</p>
                    <p className="font-medium">{selectedStudent.province}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">District</p>
                    <p className="font-medium">{selectedStudent.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Municipality</p>
                    <p className="font-medium">{selectedStudent.municipality}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tole</p>
                    <p className="font-medium">{selectedStudent.tole}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ward No</p>
                    <p className="font-medium">{selectedStudent.wardNo}</p>
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div>
                <h4 className="text-lg mb-4 pb-2 border-b border-gray-200">Guardian Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Guardian Name</p>
                    <p className="font-medium">{selectedStudent.guardianName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Guardian Phone</p>
                    <p className="font-medium">{selectedStudent.guardianPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Relation</p>
                    <p className="font-medium">{selectedStudent.guardianRelation}</p>
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div>
                <h4 className="text-lg mb-4 pb-2 border-b border-gray-200">Document Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Document Type</p>
                    <p className="font-medium">{selectedStudent.documentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Document Number</p>
                    <p className="font-medium">{selectedStudent.documentNumber}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Document Image</p>
                    {selectedStudent.documentImage && (
                      <img
                        src={selectedStudent.documentImage}
                        alt="Document"
                        className="w-full h-auto max-h-40"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Picture */}
              <div>
                <h4 className="text-lg mb-4 pb-2 border-b border-gray-200">Profile Picture</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Profile Picture</p>
                    {selectedStudent.profilePicture && (
                      <img
                        src={selectedStudent.profilePicture}
                        alt="Profile"
                        className="w-full h-auto max-h-40"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedStudent.status === 'Pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleVerify(selectedStudent.id)}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Verify & Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedStudent.id)}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verify Dialog */}
      <ConfirmDialog
        isOpen={showVerifyDialog}
        onClose={() => setShowVerifyDialog(false)}
        onConfirm={confirmVerify}
        title="Verify Student"
        message={`Are you sure you want to verify ${students.find(s => s.id === actionStudentId)?.name}'s application? This will allow them to proceed with hostel applications.`}
        confirmText="Verify & Approve"
        cancelText="Cancel"
        type="success"
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={confirmReject}
        title="Reject Application"
        message={`Are you sure you want to reject ${students.find(s => s.id === actionStudentId)?.name}'s application? This action cannot be undone.`}
        confirmText="Reject"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}