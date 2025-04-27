import mongoose, { Document, Schema } from 'mongoose';

// Interface for the LinkedIn profile
export interface ILinkedInProfile extends Document {
  profileUrl: string;
  profileName: string | null;
  profilePicture: string | null;
  headline: string | null;
  experience: {
    title: string;
    company: string;
  } | null;
  about: string | null;
  location: string | null;
  lastScraped: Date;
}

// Schema for the LinkedIn profile
const LinkedInProfileSchema = new Schema<ILinkedInProfile>({
  profileUrl: { type: String, required: true, unique: true },
  profileName: { type: String },
  profilePicture: { type: String },
  headline: { type: String },
  experience: {
    title: { type: String },
    company: { type: String }
  },
  about: { type: String },
  location: { type: String },
  lastScraped: { type: Date, default: Date.now }
});

// Create and export the model
export const LinkedInProfileModel = mongoose.model<ILinkedInProfile>(
  'LinkedInProfile', 
  LinkedInProfileSchema
);