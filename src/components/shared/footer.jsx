
import { Home } from 'lucide-react';
function Footer() {
    return (
        <footer className="w-full border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="w-60 h-10 rounded flex items-center">
              <img 
                src="/logo.png" 
                alt="HostelMate Logo" 
                className="h-auto w-40 object-contain" 
              />
            </div>
              <p className="text-gray-600 text-sm">
                Making hostel management simple, efficient, and transparent for everyone.
              </p>
            </div>

            <div>
              <h4 className="mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-cyan-400">About Us</a></li>
                <li><a href="#" className="hover:text-cyan-400">Facilities</a></li>
                <li><a href="#" className="hover:text-cyan-400">Rules & Regulations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-cyan-400">Help Center</a></li>
                <li><a href="#" className="hover:text-cyan-400">Report an Issue</a></li>
                <li><a href="#" className="hover:text-cyan-400">Contact Warden</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4">Emergency Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>📞 +977 9817704845</li>
                <li>📧 Dilibazzar, Kathmandu</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <p>© 2025 HostelMate Systems. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-cyan-400">Privacy Policy</a>
              <a href="#" className="hover:text-cyan-400">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    )
}
export default Footer;