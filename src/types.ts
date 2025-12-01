export interface User {
  id: number;
  name: string;
  mesh_url?: string;
  mesh_path: string;
}

export interface InferenceResult {
  success: boolean;
  mesh_obj: string; // The OBJ file content string
}

export interface RegisterResponse {
  success: boolean;
  user_id: number;
  message: string;
}

export interface CompareResult {
  similarity_score: number;
  user_name: string;
}

export enum CaptureMode {
  UPLOAD = 'UPLOAD',
  CAMERA = 'CAMERA'
}