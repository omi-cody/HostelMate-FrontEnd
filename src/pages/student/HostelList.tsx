import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building, SlidersHorizontal, Sparkles, Star, X, CheckCircle } from 'lucide-react';
import logo from '../../assets/logo.png';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

const BASE = 'http://localhost:9091';

export default function HostelList() {
  const { user } = useAuth();
  const [hostels, setHostels] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // AI recommendation state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ recommendation: string; ranked: any[] } | null>(null);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    studentService.searchHostels('', '')
      .then(res => { const d = res.data || res || []; setHostels(d); setFiltered(d); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    let result = hostels.filter((h: any) => {
      const nameMatch = h.hostelName?.toLowerCase().includes(q) || h.hostelKyc?.municipality?.toLowerCase().includes(q);
      const typeMatch = !typeFilter || h.hostelType === typeFilter;
      const priceMatch = !maxPrice || (h.hostelKyc?.roomPricings?.some((r: any) => r.monthlyPrice <= parseFloat(maxPrice)));
      return nameMatch && typeMatch && priceMatch;
    });

    // If AI result, sort recommended hostels to top
    if (aiResult?.ranked?.length) {
      const rankedIds = aiResult.ranked.map((r: any) => r.hostelId);
      result = [
        ...result.filter(h => rankedIds.includes(h.hostelId)),
        ...result.filter(h => !rankedIds.includes(h.hostelId)),
      ];
    }

    setFiltered(result);
  }, [search, typeFilter, maxPrice, hostels, aiResult]);

  const getMinPrice = (h: any) => {
    const prices = h.hostelKyc?.roomPricings?.map((r: any) => r.monthlyPrice) || [];
    return prices.length ? Math.min(...prices) : null;
  };

  const loadAiRecommendations = async () => {
    setAiLoading(true);
    setAiError('');
    setAiResult(null);
    try {
      const res = await studentService.getAiRecommendations();
      const d = res.data || res;
      if (d?.ranked || d?.recommendation) {
        setAiResult({ recommendation: d.recommendation || '', ranked: d.ranked || [] });
      } else {
        setAiError('Could not generate recommendations. Please try again.');
      }
    } catch (err: any) {
      setAiError(err?.response?.data?.message || 'AI recommendation unavailable. Please try again.');
    } finally { setAiLoading(false); }
  };

  // Get rank info for a hostel
  const getRank = (hostelId: string) => {
    if (!aiResult?.ranked) return null;
    const idx = aiResult.ranked.findIndex((r: any) => r.hostelId === hostelId);
    return idx >= 0 ? { rank: idx + 1, reason: aiResult.ranked[idx].reason } : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-60 h-10 rounded flex items-center justify-center">
              <img src={logo} alt="HostelMate Logo" className="h-auto w-40 object-contain" />
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            {user ? (
              <Link to={user.role === 'STUDENT' ? '/student/dashboard' : user.role === 'HOSTEL' ? '/hostel/dashboard' : '/admin/dashboard'}
                className="px-4 py-2 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 text-sm font-medium">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm">Log In</Link>
                <Link to="/student/registration" className="px-4 py-2 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 text-sm font-medium">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Title + Search */}
        <div className="mb-6">
          <h1 className="text-3xl font-medium mb-1">Find Your Hostel</h1>
          <p className="text-gray-500 mb-5">{filtered.length} hostels available</p>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search by name or location..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400 shadow-sm" />
            </div>
            <button onClick={() => setShowFilter(f => !f)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-colors ${showFilter ? 'bg-cyan-400 text-white border-cyan-400' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              <SlidersHorizontal className="w-4 h-4" />Filter
            </button>
          </div>

          {/* Filters */}
          {showFilter && (
            <div className="flex flex-wrap gap-3 mt-3 bg-white border border-gray-200 rounded-xl p-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hostel Type</label>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-cyan-400 bg-white">
                  <option value="">All Types</option>
                  <option value="BOYS">Boys</option>
                  <option value="GIRLS">Girls</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Monthly Price (Rs)</label>
                <input type="number" placeholder="e.g. 5000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-cyan-400 w-40" />
              </div>
              <div className="flex items-end">
                <button onClick={() => { setTypeFilter(''); setMaxPrice(''); }} className="px-3 py-2 text-sm text-gray-500 hover:text-red-500">Clear</button>
              </div>
            </div>
          )}
        </div>

        {/* ── AI Recommendation Panel (logged-in students only) ── */}
        {user?.role === 'STUDENT' && (
          <div className="mb-6">
            {!aiResult ? (
              <div className="">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">AI Hostel Recommendation</h3>
                    <p className="text-sm text-gray-600">
                      Get personalized hostel suggestions based on your <strong>institute location</strong>, <strong>level of study</strong>, and comparison with currently admitted students at each hostel.
                    </p>
                    {aiError && <p className="text-red-500 text-sm mt-1">{aiError}</p>}
                  </div>
                  <button onClick={loadAiRecommendations} disabled={aiLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium text-sm disabled:opacity-60 whitespace-nowrap transition-colors">
                    {aiLoading
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</>
                      : <><Sparkles className="w-4 h-4" />Get AI Picks</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-800">AI Recommendation</h3>
                  </div>
                  <button onClick={() => setAiResult(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-4 h-4" /></button>
                </div>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{aiResult.recommendation}</p>
                {aiResult.ranked.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {aiResult.ranked.map((r: any, i: number) => (
                      <div key={r.hostelId} className="flex items-center gap-1.5 bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                          {i + 1}
                        </span>
                        <span className="font-medium text-gray-800">{r.hostelName}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={loadAiRecommendations} disabled={aiLoading} className="mt-3 text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />{aiLoading ? 'Refreshing...' : 'Refresh recommendations'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hostel grid */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Building className="w-16 h-16 mx-auto mb-3 text-gray-200" />
            <p className="text-lg mb-1">No hostels found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((h: any) => {
              const minPrice = getMinPrice(h);
              const rank = getRank(h.hostelId);
              return (
                <div key={h.hostelId}
                  className={`bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all group relative ${rank ? 'border-purple-300 shadow-purple-50 shadow-sm' : 'border-gray-200'}`}>

                  {/* AI Rank badge */}
                  {rank && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-purple-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                      <Sparkles className="w-3 h-3" />AI Pick #{rank.rank}
                    </div>
                  )}

                  <div className="h-40 bg-gradient-to-br from-cyan-50 to-cyan-100 flex items-center justify-center relative overflow-hidden">
                    {h.hostelKyc?.logoUrl
                      ? <img src={`${BASE}${h.hostelKyc.logoUrl}`} className="w-full h-full object-cover" alt={h.hostelName} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                      : <Building className="w-16 h-16 text-cyan-200 group-hover:scale-110 transition-transform" />}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${h.hostelType === 'BOYS' ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white'}`}>{h.hostelType}</span>
                    {/* verified or not */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-cyan-500 text-cyan-500">{h.hostelKyc?.kycStatus ? 'Verified' : 'Not Verified'}</span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-cyan-600 transition-colors">{h.hostelName}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mb-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {h.hostelKyc?.municipality ? `${h.hostelKyc.municipality}, ${h.hostelKyc.district}` : 'Nepal'}
                    </p>

                    {/* AI reason */}
                    {rank?.reason && (
                      <p className="text-xs text-purple-600 bg-purple-50 rounded-lg px-2.5 py-1.5 mb-2 leading-relaxed">
                        {rank.reason}
                      </p>
                    )}

                    {h.hostelKyc?.amenities && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {h.hostelKyc.amenities.split(',').slice(0, 3).map((a: string) => (
                          <span key={a} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{a.trim()}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        {minPrice
                          ? <><span className="text-xs text-gray-400">From </span><span className="text-lg font-bold text-cyan-600">Rs {Number(minPrice).toLocaleString()}</span><span className="text-xs text-gray-400">/mo</span></>
                          : <span className="text-gray-400 text-sm">Price on request</span>}
                      </div>
                      <Link to={`/hostels/${h.hostelId}`}
                        className="px-4 py-2 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 text-sm font-medium transition-colors">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
