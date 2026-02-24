import { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, Building, Mail, Phone, MapPin, Users, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ConfirmDialog from '../shared/ConfirmDialog';
import { toast } from 'react-toastify';
// Placeholder image for mock data
const hostelImage = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop';

export default function HostelVerifications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [actionHostelId, setActionHostelId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const hostels = [
    {
      id: 1,
      name: 'Sunrise Block A',
      ownerName: 'John Smith',
      email: 'sunrise@example.com',
      phone: '+977 9812345678',
      type: 'Boys',
      address: 'North Campus Road, Kathmandu',
      province: 'Bagmati',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan',
      tole: 'Baneshwor',
      wardNo: '10',
      totalRooms: 30,
      amenities: ['WiFi', 'Parking', 'CCTV', 'Generator'],
      facilities: ['Gym', 'Mess', 'Study Room', 'Laundry'],
      rules: [
        'No smoking inside premises',
        'Visitors allowed till 8 PM',
        'Monthly rent to be paid by 5th',
        'Maintain cleanliness'
      ],
      pricing: {
        singleSeater: 1800,
        doubleSeater: 1200,
        tripleSeater: 900,
        fourSeater: 700,
      },
      admissionFee: 2000,
      images: [hostelImage],
      submittedDate: '2024-12-20',
      status: 'Pending',
    },
    {
      id: 2,
      name: 'Greenwood Hall',
      ownerName: 'Mary Johnson',
      email: 'greenwood@example.com',
      phone: '+977 9823456789',
      type: 'Girls',
      address: 'East Wing, Lalitpur',
      province: 'Bagmati',
      district: 'Lalitpur',
      municipality: 'Lalitpur Metropolitan',
      tole: 'Pulchowk',
      wardNo: '5',
      totalRooms: 25,
      amenities: ['WiFi', 'Security Guard', 'Water Purifier', 'Solar'],
      facilities: ['Library', 'Garden', 'Mess', 'Recreation Room'],
      rules: [
        'No male visitors',
        'Curfew at 9 PM',
        'No pets allowed',
        'Strict noise policy after 10 PM'
      ],
      pricing: {
        singleSeater: 2000,
        doubleSeater: 1500,
        tripleSeater: 1100,
        fourSeater: 800,
      },
      admissionFee: 2500,
      images: [hostelImage],
      submittedDate: '2024-12-21',
      status: 'Pending',
    },
    {
      id: 3,
      name: 'Scholars Inn',
      ownerName: 'David Wilson',
      email: 'scholars@example.com',
      phone: '+977 9834567890',
      type: 'Boys',
      address: 'South Gate, Bhaktapur',
      province: 'Bagmati',
      district: 'Bhaktapur',
      municipality: 'Bhaktapur Municipality',
      tole: 'Suryabinayak',
      wardNo: '2',
      totalRooms: 35,
      amenities: ['WiFi', 'Parking', 'Elevator', 'CCTV'],
      facilities: ['Sports Area', 'Mess', 'Common Room', 'Study Hall'],
      rules: [
        'Smoking in designated areas only',
        'Visitors till 7 PM',
        'Damage charges applicable',
        'One month advance rent'
      ],
      pricing: {
        singleSeater: 1600,
        doubleSeater: 1000,
        tripleSeater: 800,
        fourSeater: 600,
      },
      admissionFee: 1500,
      images: [hostelImage],
      submittedDate: '2024-12-22',
      status: 'Pending',
    },
    // Add more mock hostels for pagination demo
    ...Array.from({ length: 10 }, (_, i) => ({
      id: i + 4,
      name: `Hostel ${i + 4}`,
      ownerName: `Owner ${i + 4}`,
      email: `hostel${i + 4}@example.com`,
      phone: `+977 98${10000000 + i}`,
      type: i % 2 === 0 ? 'Boys' : 'Girls',
      address: 'Location',
      province: 'Bagmati',
      district: 'Kathmandu',
      municipality: 'Kathmandu',
      tole: 'Area',
      wardNo: '1',
      totalRooms: 20,
      amenities: ['WiFi', 'Parking'],
      facilities: ['Mess', 'Laundry'],
      rules: ['Basic rules'],
      pricing: {
        singleSeater: 1500,
        doubleSeater: 1000,
        tripleSeater: 800,
        fourSeater: 600,
      },
      admissionFee: 2000,
      images: [hostelImage],
      submittedDate: '2024-12-20',
      status: 'Pending',
    })),
  ];

  const handleVerify = (id) => {
    toast.success(`Hostel ${id} verified successfully!`);
    setSelectedHostel(null);
  };

  const handleReject = (id) => {
    toast.error(`Hostel ${id} rejected.`);
    setSelectedHostel(null);
  };

  // Filter hostels based on search
  const filteredHostels = hostels.filter(hostel =>
    hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hostel.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hostel.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredHostels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHostels = filteredHostels.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-1 text-cyan-400">Hostel Verifications</h2>
        <p className="text-white">Review and verify hostel registration applications</p>
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
                setCurrentPage(1);
              }}
              placeholder="Search hostels..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Pending</p>
          <p className="text-2xl text-orange-600">{hostels.filter(h => h.status === 'Pending').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Verified</p>
          <p className="text-2xl text-green-600">{hostels.filter(h => h.status === 'Verified').length}</p>
        </div>
      </div>

      {/* Hostels Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm">ID</th>
                <th className="px-6 py-3 text-left text-sm">Hostel Name</th>
                <th className="px-6 py-3 text-left text-sm">Owner</th>
                <th className="px-6 py-3 text-left text-sm">Type</th>
                <th className="px-6 py-3 text-left text-sm">Location</th>
                <th className="px-6 py-3 text-left text-sm">Rooms</th>
                <th className="px-6 py-3 text-left text-sm">Submitted</th>
                <th className="px-6 py-3 text-left text-sm">Status</th>
                <th className="px-6 py-3 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentHostels.map((hostel) => (
                <tr key={hostel.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">#{hostel.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{hostel.name}</p>
                      <p className="text-sm text-gray-500">{hostel.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{hostel.ownerName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {hostel.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{hostel.district}</td>
                  <td className="px-6 py-4 text-sm">{hostel.totalRooms}</td>
                  <td className="px-6 py-4 text-sm">{hostel.submittedDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs rounded-lg ${
                      hostel.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                      hostel.status === 'Verified' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {hostel.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedHostel(hostel)}
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredHostels.length)} of {filteredHostels.length} entries
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
      {selectedHostel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl">Hostel Verification Details</h3>
              <button
                onClick={() => setSelectedHostel(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Images */}
              <div>
                <h4 className="text-lg mb-4 pb-2 border-b border-gray-200">Hostel Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedHostel.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Hostel ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h4 className="text-lg mb-4 pb-2 border-b border-gray-200">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Hostel Name</p>
                    <p className="font-medium">{selectedHostel.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Owner Name</p>
                    <p className="font-medium">{selectedHostel.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedHostel.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedHostel.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium">{selectedHostel.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Rooms</p>
                    <p className="font-medium">{selectedHostel.totalRooms}</p>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div>
                <h4 className="text-lg mb-4 pb-2 border-b border-gray-200">Location Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Full Address</p>
                    <p className="font-medium">{selectedHostel.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Province</p>
                    <p className="font-medium">{selectedHostel.province}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">District</p>
                    <p className="font-medium">{selectedHostel.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Municipality</p>
                    <p className="font-medium">{selectedHostel.municipality}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tole</p>
                    <p className="font-medium">{selectedHostel.tole}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ward No</p>
                    <p className="font-medium">{selectedHostel.wardNo}</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h4 className="text-lg mb-4 pb-2 border-b border-gray-200">Pricing Structure</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Single Seater</p>
                    <p className="text-xl">₹{selectedHostel.pricing.singleSeater}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Double Seater</p>
                    <p className="text-xl">₹{selectedHostel.pricing.doubleSeater}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Triple Seater</p>
                    <p className="text-xl">₹{selectedHostel.pricing.tripleSeater}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Four Seater</p>
                    <p className="text-xl">₹{selectedHostel.pricing.fourSeater}</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-cyan-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Admission Fee</p>
                  <p className="text-2xl text-cyan-600">₹{selectedHostel.admissionFee}</p>
                </div>
              </div>

              {/* Amenities & Facilities */}
              <div>
                <h4 className="text-lg mb-4 pb-2 border-b border-gray-200">Amenities & Facilities</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedHostel.amenities.map((amenity, index) => (
                        <span key={index} className="px-3 py-1 bg-cyan-100 text-cyan-700 text-sm rounded-lg">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Facilities</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedHostel.facilities.map((facility, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules & Regulations */}
              <div>
                <h4 className="text-lg mb-4 pb-2 border-b border-gray-200">Rules & Regulations</h4>
                <ul className="space-y-2">
                  {selectedHostel.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              {selectedHostel.status === 'Pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setActionHostelId(selectedHostel.id);
                      setShowVerifyDialog(true);
                    }}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Verify & Approve
                  </button>
                  <button
                    onClick={() => {
                      setActionHostelId(selectedHostel.id);
                      setShowRejectDialog(true);
                    }}
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
      {showVerifyDialog && (
        <ConfirmDialog
          title="Verify Hostel"
          message={`Are you sure you want to verify hostel ${actionHostelId}?`}
          onConfirm={() => {
            if (actionHostelId) handleVerify(actionHostelId);
            setShowVerifyDialog(false);
          }}
          onCancel={() => setShowVerifyDialog(false)}
        />
      )}

      {/* Reject Dialog */}
      {showRejectDialog && (
        <ConfirmDialog
          title="Reject Hostel"
          message={`Are you sure you want to reject hostel ${actionHostelId}?`}
          onConfirm={() => {
            if (actionHostelId) handleReject(actionHostelId);
            setShowRejectDialog(false);
          }}
          onCancel={() => setShowRejectDialog(false)}
        />
      )}
    </div>
  );
}