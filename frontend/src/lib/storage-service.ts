import { createClient } from '@/lib/supabase/client';

export interface StorageUploadResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  error?: string;
}

const BUCKET_NAME = 'study-documents';

/**
 * Uploads a study document file to Supabase Storage bucket
 */
export async function uploadStudyDocumentToStorage(
  file: File,
  userId: string,
  subjectId: string
): Promise<StorageUploadResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isConfigured = Boolean(url && !url.includes('placeholder'));

  if (!isConfigured) {
    console.warn('[Exam-Buddy Storage] Running in placeholder mode. Simulating cloud upload.');
    return {
      success: true,
      filePath: `mock/${userId}/${subjectId}/${file.name}`,
      publicUrl: `https://placeholder.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${file.name}`,
    };
  }

  try {
    const supabase = createClient();

    // Generate unique storage path
    const fileExt = file.name.split('.').pop();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${userId}/${subjectId}/${Date.now()}_${sanitizedFileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('[Exam-Buddy Storage] Upload failed:', error);
      return { success: false, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      success: true,
      filePath: data.path,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    console.error('[Exam-Buddy Storage] Unexpected error:', err);
    return { success: false, error: err.message || 'Failed to upload document' };
  }
}
