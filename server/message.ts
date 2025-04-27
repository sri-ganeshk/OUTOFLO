import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LinkedInProfileModel } from './linkedinProfile';
import { auth } from './authMiddleware';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Apply auth middleware
router.use(auth);

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Function to generate personalized message using Gemini
async function generatePersonalizedMessage(profileData: any, campaignData: any): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
    Create a personalized LinkedIn outreach message with the following context:

    RECIPIENT:
    Name: ${profileData.name || 'N/A'}
    Job Title: ${profileData.job_title || profileData.headline || 'N/A'}
    Company: ${profileData.company || (profileData.experience?.company || 'N/A')}
    Location: ${profileData.location || 'N/A'}
    Summary: ${profileData.summary || profileData.about || 'N/A'}

    CAMPAIGN:
    Name: ${campaignData.name || 'N/A'}
    Description: ${campaignData.description || 'N/A'}
    
    The message should be friendly, professional, and reference their background.
    It should mention Outflo's ability to help automate outreach to increase meetings & sales.    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating message with Gemini:', error);
    return "I noticed your profile and thought Outflo could help automate your outreach to increase meetings & sales. Would love to connect!";
  }
}

// Only showing the affected route handler

router.post('/', async (req, res) => {
  try {
    const { profileData, campaignData } = req.body;
    
    // Validate required fields
    if (!profileData) {
      return res.status(400).json({ message: 'Profile data is required' });
    }
    
    if (!campaignData) {
      return res.status(400).json({ message: 'Campaign data is required' });
    }
    
    // If LinkedIn URL is provided instead of profile details
    if (profileData.profileUrl) {
      // Try to find profile in database
      const linkedInProfile = await LinkedInProfileModel.findOne({ profileUrl: profileData.profileUrl });
      
      if (linkedInProfile) {
        // Map LinkedIn profile data to the expected format
        profileData.name = linkedInProfile.profileName;
        profileData.job_title = linkedInProfile.headline?.split(' at ')[0] || '';
        profileData.company = linkedInProfile.experience?.company || 
                             (linkedInProfile.headline?.split(' at ')[1] || '');
        profileData.location = linkedInProfile.location;
        profileData.summary = linkedInProfile.about;
      }
    }
    
    const message = await generatePersonalizedMessage(profileData, campaignData);
    
    return res.json({ message });
  } catch (error) {
    return res.status(500).json({ message: 'Error generating personalized message', error });
  }
});

export default router;