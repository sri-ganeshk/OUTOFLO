import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCampaign, createCampaign, updateCampaign } from '../services/api';

const CampaignForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    leads: [] as string[]
  });
  const [leadsInput, setLeadsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      
      try {
        const response = await getCampaign(id);
        const { name, description, status, leads } = response.data;
        setFormData({ name, description, status, leads });
      } catch (err) {
        console.error(err);
        setError('Failed to fetch campaign data');
      } finally {
        setFetchLoading(false);
      }
    };

    if (isEditMode) {
      fetchCampaign();
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLeadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeadsInput(e.target.value);
  };

  const handleAddLead = () => {
    if (!leadsInput.trim()) return;
    
    const newLead = leadsInput.trim();
    if (formData.leads.includes(newLead)) return;
    
    setFormData({
      ...formData,
      leads: [...formData.leads, newLead]
    });
    setLeadsInput('');
  };

  const handleRemoveLead = (leadToRemove: string) => {
    setFormData({
      ...formData,
      leads: formData.leads.filter(lead => lead !== leadToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isEditMode && id) {
        // Updating existing campaign
        const { name, description, leads } = formData;
        await updateCampaign(id, { name, description, leads });
      } else {
        // Creating new campaign
        await createCampaign(formData);
      }
      navigate('/campaigns');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        {isEditMode ? 'Edit Campaign' : 'Create New Campaign'}
      </h1>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-500 to-primary-500 h-2"></div>
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter campaign name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out h-24 resize-none"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the purpose of this campaign"
              ></textarea>
            </div>
            
            {!isEditMode && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  name="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leads</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="https://www.linkedin.com/in/username"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out"
                  value={leadsInput}
                  onChange={handleLeadInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLead())}
                />
                <button 
                  type="button"
                  onClick={handleAddLead}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.leads.map((lead, index) => (
                  <div key={index} className="bg-gray-100 rounded-full px-3 py-1.5 text-sm flex items-center gap-2 border border-gray-200">
                    <span className="truncate max-w-[250px]">{lead}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveLead(lead)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Remove lead"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))}
                {formData.leads.length === 0 && (
                  <p className="text-gray-500 text-sm italic py-2">No leads added yet</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <button 
                type="button"
                onClick={() => navigate('/campaigns')}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className={`bg-primary-600 hover:bg-primary-700 text-black px-5 py-2.5 rounded-lg font-medium transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                  </div>
                ) : (
                  isEditMode ? 'Update Campaign' : 'Create Campaign'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CampaignForm;