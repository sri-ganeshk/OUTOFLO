export interface User {
    id: string;
    email: string;
    name: string;
  }
  
  export interface AuthResponse {
    message: string;
    token: string;
    user: User;
  }
  
  export interface Campaign {
    _id: string;
    name: string;
    description: string;
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
    leads: string[];
    userId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ProfileData {
    name?: string;
    headline?: string;
    about?: string;
    experience?: {
      title?: string;
      company?: string;
    };
    location?: string;
    profileUrl?: string;
  }

  
  export interface GeneratedMessage {
    message: string;
  }