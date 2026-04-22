import { useEffect, useState } from 'react';
import { Building, Plus, Trash2, Users, BedDouble, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { hostelService } from '../../services/hostelService';
import { toast } from 'react-toastify';

const BASE = 'http://localhost:9091';
const TYPE_CAP: Record<string, number> = { SINGLE: 1, DOUBLE: 2, TRIPLE: 3, QUAD: 4 };

export default function HostelRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const[showDeleteModel, setShowDeleteModel] = useState(false);
  const [adding, setAdding] = useState(false);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [form, setForm] = useState({ roomNumber: '', floor: '', roomType: 'SINGLE' });

  const load = () =>
    hostelService.getRooms()
      .then(r => setRooms(r.data || r || []))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await hostelService.addRoom({ ...form, floor: parseInt(form.floor) });
      toast.success('Room added successfully!');
      setShow(false);
      setForm({ roomNumber: '', floor: '', roomType: 'SINGLE' });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not add room. Number may already exist.');
    } finally { setAdding(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this room? Cannot delete if students are currently assigned.')) return;
    try {
      await hostelService.deleteRoom(id);
      toast.success('Room deleted');
      setRooms(r => r.filter(x => x.roomId !== id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Cannot delete — students are assigned to this room.');
    }
  };

  // Summary stats
  const totalBeds = rooms.reduce((s, r) => s + (r.capacity || TYPE_CAP[r.roomType] || 1), 0);
  const occupiedBeds = rooms.reduce((s, r) => {
    const active = (r.admissions || []).filter((a: any) => a.status === 'ACTIVE').length;
    return s + active;
  }, 0);
  const availableBeds = totalBeds - occupiedBeds;

  return (
    <DashboardLayout title="Room Management">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{totalBeds}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Beds</p>
        </div>
        <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-cyan-700">{occupiedBeds}</p>
          <p className="text-xs text-cyan-500 mt-0.5">Occupied</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{availableBeds}</p>
          <p className="text-xs text-green-500 mt-0.5">Available</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-5">
        <p className="text-gray-500 text-sm">{rooms.length} rooms total</p>
        <button onClick={() => setShow(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />Add Room
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Building className="w-14 h-14 mx-auto mb-3 text-gray-200" />
          <p className="mb-2">No rooms added yet.</p>
          <p className="text-sm">Add rooms to make your hostel available to students.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((r: any) => {
            const cap = r.capacity || TYPE_CAP[r.roomType] || 1;
            const activeAdmissions = (r.admissions || []).filter((a: any) => a.status === 'ACTIVE');
            const occupied = activeAdmissions.length;
            const available = cap - occupied;
            const isFull = available === 0;
            const isExpanded = expandedRoom === r.roomId;

            return (
              <div key={r.roomId} className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                isFull ? 'border-red-200' : available > 0 ? 'border-green-200' : 'border-gray-200'
              }`}>
                {/* Room header - always visible */}
                <div className="flex items-center gap-4 p-4">
                  {/* Room number badge */}
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-bold ${
                    isFull ? 'bg-red-100 text-red-700' : 'bg-cyan-100 text-cyan-700'
                  }`}>
                    <span className="text-xs font-normal">Room</span>
                    <span className="text-lg leading-tight">{r.roomNumber}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-800">Room {r.roomNumber}</span>
                      <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-lg font-medium">{r.roomType}</span>
                      <span className="text-gray-400 text-xs">Floor {r.floor}</span>
                    </div>

                    {/* Occupancy bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[120px]">
                        <div
                          className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-cyan-400'}`}
                          style={{ width: `${(occupied / cap) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${isFull ? 'text-red-600' : 'text-gray-600'}`}>
                        {occupied}/{cap} {isFull ? '· Full' : `· ${available} available`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Expand button to see students */}
                    <button
                      onClick={() => setExpandedRoom(isExpanded ? null : r.roomId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      <Users className="w-4 h-4" />
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setShowDeleteModel(true)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {showDeleteModel && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                      <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
                      <p className="mb-6 text-gray-600">Are you sure you want to delete room {r.roomNumber}? This action cannot be undone.</p>
                      <div className="flex gap-3">
                        <button onClick={() => setShowDeleteModel(false)}
                          className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={() => { del(r.roomId); setShowDeleteModel(false); }}
                          className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                

                {/* Expanded: student list */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Students in this room ({occupied})
                    </p>
                    {activeAdmissions.length === 0 ? (
                      <p className="text-sm text-gray-400">No students currently assigned to this room.</p>
                    ) : (
                      <div className="space-y-2">
                        {activeAdmissions.map((a: any) => (
                          <div key={a.admissionId} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                            <div className="w-9 h-9 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {a.student?.studentKyc?.profilePhotoUrl
                                ? <img src={`${BASE}${a.student.studentKyc.profilePhotoUrl}`}
                                    className="w-full h-full object-cover" alt="profile" />
                                : <span className="text-cyan-700 font-semibold text-sm">
                                    {a.student?.user?.fullName?.charAt(0)}
                                  </span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{a.student?.user?.fullName}</p>
                              <p className="text-xs text-gray-400 truncate">{a.student?.user?.email}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-cyan-600 font-medium">Rs {a.monthlyFeeAmount}/mo</p>
                              <p className="text-xs text-gray-400">Since {a.admittedDate}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Available slots */}
                    {available > 0 && (
                      <div className="mt-2 flex gap-2">
                        {Array.from({ length: available }).map((_, i) => (
                          <div key={i} className="flex-1 border-2 border-dashed border-green-200 rounded-xl p-2 text-center">
                            <p className="text-xs text-green-500 font-medium">Available</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Room Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Add New Room</h2>
            <form onSubmit={add} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Room Number *</label>
                <input type="text" required value={form.roomNumber}
                  onChange={e => setForm(f => ({...f, roomNumber: e.target.value}))}
                  placeholder="e.g. 101, A1, Ground-1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Floor *</label>
                <input type="number" required min="0" value={form.floor}
                  onChange={e => setForm(f => ({...f, floor: e.target.value}))}
                  placeholder="0 = Ground floor"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Room Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['SINGLE', '1 person'],
                    ['DOUBLE', '2 persons'],
                    ['TRIPLE', '3 persons'],
                    ['QUAD', '4 persons'],
                  ].map(([t, desc]) => (
                    <button key={t} type="button"
                      onClick={() => setForm(f => ({...f, roomType: t}))}
                      className={`py-2.5 border-2 rounded-xl text-sm font-medium transition-all ${
                        form.roomType === t ? 'border-cyan-400 bg-cyan-50 text-cyan-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {t}
                      <span className="block text-xs font-normal text-gray-400 mt-0.5">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShow(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={adding}
                  className="flex-1 py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium disabled:opacity-60">
                  {adding ? 'Adding...' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
