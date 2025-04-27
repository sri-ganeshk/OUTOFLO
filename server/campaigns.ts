import express from 'express';
import mongoose, { Document, Schema } from 'mongoose';
import { LinkedInProfileModel } from './linkedinProfile';
import { fetchProfileAndSaveToDatabase } from './scraper';
import { auth } from './authMiddleware';

// Define types
interface ICampaign extends Document {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  leads: string[];
  userId: mongoose.Types.ObjectId; // Add userId to associate campaigns with users
  createdAt: Date;
  updatedAt: Date;
}

// Create Campaign Schema
const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['ACTIVE', 'INACTIVE', 'DELETED'], 
      default: 'ACTIVE' 
    },
    leads: [{ type: String, validate: {
      validator: (value: string) => {
        return value.startsWith('https://linkedin.com/in/') || 
               value.startsWith('https://www.linkedin.com/in/');
      },
      message: 'Lead must be a valid LinkedIn profile URL'
    }}],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true } // Reference to the User model
  },
  { timestamps: true }
);

// Create model
export const CampaignModel = mongoose.model<ICampaign>('Campaign', CampaignSchema);

// Create router
const router = express.Router();

// Apply auth middleware to all campaign routes
router.use(auth);

// GET all campaigns for the authenticated user (excluding DELETED)
router.get('/', async (req, res) => {
  try {
    const campaigns = await CampaignModel.find({ 
      userId: req.userId, 
      status: { $ne: 'DELETED' } 
    });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaigns', error });
  }
});

// GET campaign by ID with lead details (only if it belongs to the authenticated user)
// Only showing the affected route handlers

// GET campaign by ID with lead details
router.get('/:id', async (req, res) => {
  try {
    const campaign = await CampaignModel.findOne({ 
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    if (campaign.status === 'DELETED') {
      return res.status(404).json({ message: 'Campaign has been deleted' });
    }
    
    // Fetch details for each lead
    const leadDetails = await Promise.all(
      campaign.leads.map(async (leadUrl) => {
        const profile = await LinkedInProfileModel.findOne({ profileUrl: leadUrl });
        return {
          url: leadUrl,
          profile: profile || { message: 'Profile details not available' }
        };
      })
    );
    
    // Return campaign with lead details
    return res.json({
      ...campaign.toObject(),
      leadDetails
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching campaign', error });
  }
});

// POST new campaign
router.post('/', async (req, res) => {
  try {
    const { name, description, status, leads } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }
    
    const campaign = new CampaignModel({
      name,
      description,
      status: status || 'ACTIVE',
      leads: leads || [],
      userId: req.userId
    });
    
    // Process LinkedIn profiles for each lead
    if (leads && leads.length > 0) {
      for (const lead of leads) {
        // Check if profile already exists in database
        const existingProfile = await LinkedInProfileModel.findOne({ profileUrl: lead });
        
        if (!existingProfile) {
          // If not, scrape and save
          try {
            await fetchProfileAndSaveToDatabase(lead);
          } catch (error) {
            console.error(`Failed to scrape profile ${lead}:`, error);
            // Continue with next lead
          }
        }
      }
    }
    
    const savedCampaign = await campaign.save();
    return res.status(201).json(savedCampaign);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating campaign', error });
  }
});

// PUT update campaign
router.put('/:id', async (req, res) => {
  try {
    const { name, description, status, leads } = req.body;
    
    // Validate status
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either ACTIVE or INACTIVE' });
    }
    
    // Find campaign
    const campaign = await CampaignModel.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    if (campaign.status === 'DELETED') {
      return res.status(404).json({ message: 'Cannot update a deleted campaign' });
    }
    
    // Process new LinkedIn profiles for any new leads
    if (leads && leads.length > 0) {
      for (const lead of leads) {
        // Check if this is a new lead
        if (!campaign.leads.includes(lead)) {
          // Check if profile already exists in database
          const existingProfile = await LinkedInProfileModel.findOne({ profileUrl: lead });
          
          if (!existingProfile) {
            // If not, scrape and save
            try {
              await fetchProfileAndSaveToDatabase(lead);
            } catch (error) {
              console.error(`Failed to scrape profile ${lead}:`, error);
              // Continue with next lead
            }
          }
        }
      }
    }
    
    // Update campaign
    const updatedCampaign = await CampaignModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, description, status, leads },
      { new: true, runValidators: true }
    );
    
    return res.json(updatedCampaign);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating campaign', error });
  }
});

// DELETE campaign
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await CampaignModel.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    if (campaign.status === 'DELETED') {
      return res.status(400).json({ message: 'Campaign is already deleted' });
    }
    
    campaign.status = 'DELETED';
    await campaign.save();
    
    return res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting campaign', error });
  }
});
export default router;