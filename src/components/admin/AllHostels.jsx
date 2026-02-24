import { Search, MapPin, Users, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function AllHostels() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 6;

  const hostels = [
    { 
      id: 1, 
      name: 'Sunrise Block A', 
      owner: 'John Smith',
      location: 'North Campus, Kathmandu',
      totalRooms: 20,
      occupiedRooms: 14,
      students: 24,
      rating: 4.8,
      status: 'Verified',
      type: 'Boys'
    },
    { 
      id: 2, 
      name: 'Greenwood Hall', 
      owner: 'Mary Johnson',
      location: 'East Wing, Lalitpur',
      totalRooms: 15,
      occupiedRooms: 12,
      students: 18,
      rating: 4.5,
      status: 'Verified',
      type: 'Girls'
    },
    { 
      id: 3, 
      name: 'Scholars Inn', 
      owner: 'David Wilson',
      location: 'South Gate, Bhaktapur',
      totalRooms: 25,
      occupiedRooms: 20,
      students: 32,
      rating: 4.2,
      status: 'Verified',
      type: 'Boys'
    },
  ];

  const filteredHostels = hostels.filter(hostel =>
    hostel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentHostels = filteredHostels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredHostels.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1 text-cyan-400">All Hostels</h2>
          <p className="text-white">Manage all registered hostels</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hostels..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400">
            <option>All Types</option>
            <option>Boys</option>
            <option>Girls</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400">
            <option>All Status</option>
            <option>Verified</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Total Hostels</p>
          <p className="text-3xl">{hostels.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Verified</p>
          <p className="text-3xl text-green-600">{hostels.filter(h => h.status === 'Verified').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Total Students</p>
          <p className="text-3xl text-cyan-600">{hostels.reduce((sum, h) => sum + h.students, 0)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Average Occupancy</p>
          <p className="text-3xl text-orange-600">78%</p>
        </div>
      </div>

      {/* Hostels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentHostels.map((hostel) => (
          <div key={hostel.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl mb-1">{hostel.name}</h3>
                  <p className="text-sm text-gray-600">Owner: {hostel.owner}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-lg">
                  {hostel.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {hostel.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  {hostel.students} students
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                  <span>{hostel.rating} rating</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Total Rooms</p>
                  <p className="font-medium">{hostel.totalRooms}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Occupied</p>
                  <p className="font-medium">{hostel.occupiedRooms}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Available</p>
                  <p className="font-medium">{hostel.totalRooms - hostel.occupiedRooms}</p>
                </div>
              </div>

              <button className="w-full py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <button
          className="px-4 py-2 bg-white text-gray-600 rounded-lg disabled:opacity-50 flex items-center"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-gray-600">
          Page {currentPage} of {totalPages}
        </p>
        <button
          className="px-4 py-2 bg-white text-gray-600 rounded-lg disabled:opacity-50 flex items-center"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}