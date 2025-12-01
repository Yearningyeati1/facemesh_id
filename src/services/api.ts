import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
});

export const checkBackendHealth = async () => {
  try {
    await api.get('/');
    return true;
  } catch (e) {
    return false;
  }
};

export const arraysToObj = (vertices: number[][], faces: number[][]) => {
  let obj = "";
  vertices.forEach(v => obj += `v ${v[0]} ${v[1]} ${v[2]}\n`);
  faces.forEach(f => obj += `f ${f[0] + 1} ${f[1] + 1} ${f[2] + 1}\n`);
  return obj;
};

export const performInference = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await api.post('/inference', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (res.data.success) {
      const mesh_obj = arraysToObj(res.data.vertices, res.data.faces);
      return {
        success: true,
        mesh_obj,
        vertices: res.data.vertices,
        faces: res.data.faces,
        code: res.data.code
      };
    }
    return { success: false, message: "Inference failed" };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Network error" };
  }
};

export const registerUser = async (name: string, vertices: number[][], faces: number[][], code: number[]) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('vertices', JSON.stringify(vertices));
  formData.append('faces', JSON.stringify(faces));
  formData.append('code', JSON.stringify(code));

  try {
    const res = await api.post('/register', formData);
    return { success: true, user_id: res.data.id };
  } catch (e: any) {
    return { success: false, message: e.response?.data?.detail || "Registration failed" };
  }
};

export const fetchUsers = async () => {
  try {
    const res = await api.get('/users');
    return res.data;
  } catch (e) {
    return [];
  }
};

export const compareFace = async (userId: number, vertices: number[][], faces: number[][], code: number[]) => {
  const formData = new FormData();
  formData.append('user_id', userId.toString());
  formData.append('vertices', JSON.stringify(vertices));
  formData.append('faces', JSON.stringify(faces));
  formData.append('code', JSON.stringify(code));

  try {
    const res = await api.post('/compare', formData);
    return {
      similarity_score: res.data.similarity,
      user_name: res.data.matched_user
    };
  } catch (e) {
    throw e;
  }
};

export const deleteUser = async (userId: number) => {
  try {
    await api.delete(`/users/${userId}`);
    return true;
  } catch (e) {
    return false;
  }
};

export const updateUser = async (userId: number, name: string) => {
  try {
    const res = await api.put(`/users/${userId}`, { name });
    return res.data;
  } catch (e) {
    throw e;
  }
};

export const identifyUser = async (code: number[]) => {
  const formData = new FormData();
  formData.append('code', JSON.stringify(code));

  try {
    const res = await api.post('/identify', formData);
    return res.data.matches;
  } catch (e) {
    throw e;
  }
};