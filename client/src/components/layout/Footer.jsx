import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h2 className="text-lg font-bold text-teal-600">MediCore</h2>
            <p className="text-sm text-gray-500 mt-1">
              Find cheaper salt equivalents. Save on every medicine.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-teal-600 transition-colors">Home</Link></li>
              <li><Link to="/search" className="hover:text-teal-600 transition-colors">Search Medicines</Link></li>
              <li><Link to="/orders" className="hover:text-teal-600 transition-colors">My Orders</Link></li>
              <li><Link to="/profile" className="hover:text-teal-600 transition-colors">Profile</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">About</h3>
            <p className="text-sm text-gray-500">
              MediCore uses the Salt Alternate Algorithm to surface cheaper generic
              equivalents — so you always know your best option.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} MediCore. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
