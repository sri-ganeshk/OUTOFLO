import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Outflo, {user?.name}!
        </h1>
        
        <p className="text-xl text-gray-600">
          Your LinkedIn outreach automation platform
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-8 mt-12">
        <Link to="/campaigns" className="w-full md:w-72 group">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:transform group-hover:-translate-y-1">
            <div className="bg-gradient-to-r from-blue-500 to-primary-500 h-2"></div>
            <div className="p-8">
              <div className="flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-center text-gray-800 mb-2">View Campaigns</h2>
              <p className="text-gray-600 text-center">Manage your outreach campaigns and track their performance</p>
            </div>
          </div>
        </Link>
        
      </div>
    </div>
  );
};

export default Dashboard;