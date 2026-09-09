export type Wedding = {
  id: string;
  couple_names: string;
  event_name: string;
  event_date: string;
  location: string;
  description?: string;
  theme?: string;
  cover_image_url?: string;
  owner_id: string;
  public_url: string;
  qr_code?: string;
  privacy_settings: PrivacySettings;
  statistics: Statistics;
  created_at: string;
  updated_at: string;
};

export type PrivacySettings = {
  is_public: boolean;
  require_approval: boolean;
  allow_guests: boolean;
  allow_comments: boolean;
};

export type Statistics = {
  total_photos: number;
  total_videos: number;
  total_guests: number;
  total_uploads: number;
  storage_used_mb: number;
};

export type Media = {
  id: string;
  wedding_id: string;
  uploader_session_id: string;
  uploader_name: string;
  file_name: string;
  file_type: 'image' | 'video';
  file_size: number;
  mime_type: string;
  storage_path: string;
  storage_url: string;
  thumbnail_url?: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  likes: number;
  liked_by: string[];
  uploaded_at: string;
};

export type Message = {
  id: string;
  wedding_id: string;
  uploader_session_id: string;
  uploader_name: string;
  message_text: string;
  created_at: string;
};

export type Category = {
  id: string;
  wedding_id: string;
  name: string;
  description?: string;
  icon?: string;
  order_index: number;
  created_at: string;
};
