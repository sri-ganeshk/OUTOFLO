import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <nav className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-black text-2xl font-bold tracking-tight">
                                Outflo
                            </Link>
                        </div>
                    </div>
                    
                    <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                        {isAuthenticated ? (
                            <>
                                <div className="text-black px-3 py-2">Welcome, {user?.name}</div>
                                <Link to="/campaigns" className="text-black hover:bg-primary-800 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                                    Campaigns
                                </Link>
                                <button 
                                    onClick={logout}
                                    className="text-black bg-primary-900 hover:bg-primary-800 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-black hover:bg-primary-800 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                                    Login
                                </Link>
                                <Link to="/signup" className="text-black bg-primary-900 hover:bg-primary-800 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                    
                    <div className="flex items-center md:hidden">
                        <button 
                            onClick={toggleMobileMenu}
                            className="text-black hover:bg-primary-800 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                            aria-expanded="false"
                        >
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            {mobileMenuOpen && (
                <div className="md:hidden bg-primary-800">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {isAuthenticated ? (
                            <>
                                <div className="text-black block px-3 py-2 font-medium">Welcome, {user?.name}</div>
                                <Link to="/campaigns" className="text-black hover:bg-primary-900 block px-3 py-2 rounded-md text-base font-medium">
                                    Campaigns
                                </Link>
                                <Link to="/message-generator" className="text-black hover:bg-primary-900 block px-3 py-2 rounded-md text-base font-medium">
                                    Message Generator
                                </Link>
                                <button 
                                    onClick={logout}
                                    className="w-full text-left text-black hover:bg-primary-900 block px-3 py-2 rounded-md text-base font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-black hover:bg-primary-900 block px-3 py-2 rounded-md text-base font-medium">
                                    Login
                                </Link>
                                <Link to="/signup" className="text-black hover:bg-primary-900 block px-3 py-2 rounded-md text-base font-medium">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;