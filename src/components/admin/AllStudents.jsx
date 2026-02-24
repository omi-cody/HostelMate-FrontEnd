import { Search, MapPin, Building, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function AllStudents() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const students = [
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com', 
      phone: '+977 9812345678',
      hostel: 'Sunrise Block A',
      room: '204',
      status: 'Active',
      course: 'Bachelor in Computer Science'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      phone: '+977 9823456789',
      hostel: 'Greenwood Hall',
      room: '105',
      status: 'Active',
      course: 'Master in Business Administration'
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      email: 'mike@example.com', 
      phone: '+977 9834567890',
      hostel: 'Scholars Inn',
      room: '302',
      status: 'Active',
      course: 'Bachelor in Engineering'
    },
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1 text-cyan-500">All Students</h2>
          <p className="text-white">Manage all registered students</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Total Students</p>
          <p className="text-3xl">{students.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Active</p>
          <p className="text-3xl text-green-600">{students.filter(s => s.status === 'Active').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Verified</p>
          <p className="text-3xl text-cyan-600">{students.length}</p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Course</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Hostel</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Room</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.course}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4 text-gray-400" />
                      {student.hostel}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.room}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-lg">
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-cyan-400 hover:text-cyan-600 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-gray-600">
          Page {currentPage} of {totalPages}
        </p>
        <button
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}