import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCampaign, updateCampaign, deleteCampaign, generateMessage } from '../services/api';
import { Campaign } from '../types';

interface LeadDetail {
  url: string;
  profile: {
    _id: string;
    profileUrl: string;
    profileName?: string;
    profilePicture?: string;
    headline?: string;
    about?: string;
    location?: string;
    experience?: {
      title?: string;
      company?: string;
    } | null;
    lastScraped: string;
  };
}



interface CampaignWithLeadDetails extends Campaign {
  leadDetails?: LeadDetail[];
}

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignWithLeadDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leads: [] as string[],
  });
  const [newLeadUrl, setNewLeadUrl] = useState('');
  
  // New state for message generation
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);

  useEffect(() => {
    const fetchCampaignAndUser = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch campaign data
        const campaignResponse = await getCampaign(id);
        setCampaign(campaignResponse.data);
        setFormData({
          name: campaignResponse.data.name,
          description: campaignResponse.data.description,
          leads: campaignResponse.data.leads || [],
        });
        

        
      } catch (err: any) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignAndUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateCampaign(id, formData);
      // Refresh campaign data after update
      const response = await getCampaign(id);
      setCampaign(response.data);
      setEditMode(false);
    } catch (err) {
      setError('Failed to update campaign');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id);
        navigate('/campaigns');
      } catch (err) {
        setError('Failed to delete campaign');
        console.error(err);
      }
    }
  };

  const addLead = () => {
    if (!newLeadUrl) return;
    
    // Simple validation for LinkedIn URL
    if (!newLeadUrl.includes('linkedin.com/in/')) {
      setError('Please enter a valid LinkedIn profile URL');
      return;
    }

    // Add new lead to the formData
    setFormData({
      ...formData,
      leads: [...formData.leads, newLeadUrl]
    });
    setNewLeadUrl('');
    setError('');
  };

  const removeLead = (leadUrl: string) => {
    setFormData({
      ...formData,
      leads: formData.leads.filter(lead => lead !== leadUrl)
    });
  };
  
  // New function to handle message generation
  const handleGenerateMessage = async (lead: LeadDetail) => {
    if (!campaign ) return;
    
    setSelectedLead(lead);
    setGeneratingMessage(true);
    setShowMessageModal(true);
    setMessageSuccess(false);
    
    try {
      const profileData = {
        name: lead.profile.profileName,
        headline: lead.profile.headline,
        about: lead.profile.about,
        location: lead.profile.location,
        experience: lead.profile.experience || undefined,
        profileUrl: lead.profile.profileUrl
      };
      
      const campaignData = {
        name: campaign.name,
        description: campaign.description
      };
      
      
      const response = await generateMessage({ profileData, campaignData });
      setGeneratedMessage(response.data.message);
      setMessageSuccess(true);
    } catch (err) {
      console.error('Failed to generate message:', err);
      setError('Failed to generate personalized message');
    } finally {
      setGeneratingMessage(false);
    }
  };
  
  // Function to copy message to clipboard
  const copyMessageToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage)
      .then(() => {
        // Show temporary success indicator
        const copyBtn = document.getElementById('copy-message-btn');
        if (copyBtn) {
          copyBtn.innerText = 'Copied!';
          setTimeout(() => {
            copyBtn.innerText = 'Copy Message';
          }, 2000);
        }
      })
      .catch(err => {
        console.error('Failed to copy message:', err);
        setError('Failed to copy message to clipboard');
      });
  };

  // Helper function to extract LinkedIn username from URL
  const extractLinkedInUsername = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // Get the last part of the path (username)
      const username = pathParts[pathParts.length - 1] || pathParts[pathParts.indexOf('in') + 1] || '';
      return username || url;
    } catch {
      return url;
    }
  };

  // Function to truncate text with ellipsis
  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return "-";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-black"></div>
      </div>
    );
  }

  if (!campaign && !loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Campaign not found</h1>
          <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist or has been deleted.</p>
          <Link to="/campaigns" className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium">
            Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
          {error}
          <button 
            className="float-right text-red-700 hover:text-red-900"
            onClick={() => setError('')}
          >
            &times;
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/campaigns" className="mr-4 text-gray-600 hover:text-black transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            {!editMode ? (
              <h1 className="text-2xl font-bold text-gray-800">{campaign?.name || "-"}</h1>
            ) : (
              <h1 className="text-2xl font-bold text-gray-800">Edit Campaign</h1>
            )}
          </div>
          <div className="flex space-x-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="border border-black hover:bg-gray-100 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="border border-gray-400 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-6">
          {!editMode ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status</h2>
                <p className="mt-1">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    campaign?.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : campaign?.status === 'INACTIVE'
                      ? 'bg-gray-100 text-gray-600 border border-gray-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {campaign?.status || "-"}
                  </span>
                </p>
              </div>
              
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Description</h2>
                <p className="mt-1 text-gray-800">{campaign?.description || "-"}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Created</h2>
                <p className="mt-1 text-gray-800">
                  {campaign?.createdAt ? new Date(campaign.createdAt).toLocaleString() : "-"}
                </p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Leads ({campaign?.leads?.length || 0})
                </h2>
                {campaign?.leadDetails && campaign.leadDetails.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {campaign.leadDetails.map((leadDetail, index) => (
                        <li key={index} className="p-4 hover:bg-gray-100 transition-colors">
                          <div className="flex items-start space-x-4">
                            {leadDetail.profile.profilePicture ? (
                              <div className="flex-shrink-0">
                                <img
                                  src={leadDetail.profile.profilePicture}
                                  alt={leadDetail.profile.profileName || "Profile"}
                                  className="h-12 w-12 rounded-full object-cover border border-gray-200"
                                />

                              </div>
                            ) : (
                              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <svg className="h-6 w-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <a 
                                  href={leadDetail.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center"
                                >
                                  <span className="truncate">{leadDetail.profile.profileName || extractLinkedInUsername(leadDetail.url)}</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>

                                {/* Message generation button */}
                                <button
                                  onClick={() => handleGenerateMessage(leadDetail)}
                                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                                  title="Generate personalized message"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                  </svg>
                                  Message
                                </button>
                              </div>
                              
                              {leadDetail.profile.headline && (
                                <p className="text-sm text-gray-600 mb-1">{truncateText(leadDetail.profile.headline, 100)}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                {leadDetail.profile.location && (
                                  <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {leadDetail.profile.location}
                                  </span>
                                )}
                                {leadDetail.profile.experience && leadDetail.profile.experience.title && (
                                  <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                                    </svg>
                                    {leadDetail.profile.experience.title}
                                    {leadDetail.profile.experience.company && ` at ${leadDetail.profile.experience.company}`}
                                  </span>
                                )}
                              </div>
                              
                              {leadDetail.profile.about && (
                                <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                                  {truncateText(leadDetail.profile.about, 150)}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                    <p className="text-gray-600">No leads added to this campaign yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Add leads to start tracking your prospects.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                  placeholder="Campaign name"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                  placeholder="Campaign description"
                />
              </div>
              
              {/* Leads management section in edit mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leads ({formData.leads.length})
                </label>
                
                <div className="mb-4 flex">
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/username"
                    value={newLeadUrl}
                    onChange={(e) => setNewLeadUrl(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-black focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={addLead}
                    className="bg-black text-white px-4 py-2 rounded-r-md hover:bg-gray-800 transition-colors"
                  >
                    Add Lead
                  </button>
                </div>
                
                {formData.leads.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {formData.leads.map((lead, index) => (
                        <li key={index} className="p-3 flex justify-between items-center hover:bg-gray-100">
                          <div className="flex items-center">
                            <svg 
                              className="h-5 w-5 text-blue-600 mr-2" 
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                            <span className="text-gray-800 truncate max-w-xs">
                              {extractLinkedInUsername(lead)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLead(lead)}
                            className="text-red-600 hover:text-red-800 p-1"
                            aria-label="Remove lead"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
                    <p className="text-gray-600">No leads added yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Add LinkedIn profile URLs above.</p>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Message generation modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">
                {generatingMessage ? 'Generating Message...' : 'Personalized Message'}
              </h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {generatingMessage ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-black"></div>
                  <p className="text-gray-600">Crafting your personalized message...</p>
                </div>
              ) : messageSuccess ? (
                <>
                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      {selectedLead?.profile.profilePicture ? (
                        <img
                          src={selectedLead.profile.profilePicture}
                          alt={selectedLead.profile.profileName || "Profile"}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200 mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {selectedLead?.profile.profileName || extractLinkedInUsername(selectedLead?.url || '')}
                        </h4>
                        {selectedLead?.profile.headline && (
                          <p className="text-sm text-gray-600">{truncateText(selectedLead.profile.headline, 50)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{generatedMessage}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      id="copy-message-btn"
                      onClick={copyMessageToClipboard}
                      className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5" />
                      </svg>
                      Copy Message
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-800 font-medium">Failed to generate message</p>
                  <p className="text-gray-600 text-sm mt-1">Please try again later</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500">
                The personalized message is generated based on the lead's LinkedIn profile and your campaign details.
                Feel free to edit the message before sending it.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetail;
