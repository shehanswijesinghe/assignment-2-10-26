import { http } from './client';
import { AdminProduct, ApiEnvelope, Category, DashboardStats, ProductStats, RatingSummary, UploadedImage, User } from './types';
import type { ProductStatus, UserStatus } from '@/lib/constants';

const get = <T>(url: string, params?: object) => http.get<ApiEnvelope<T>>(url, { params });

export const authApi = {
  register: (b: { firstName: string; lastName: string; email: string; password: string }) =>
    http.post<ApiEnvelope<{ email: string }>>('/auth/register', b),
  verifyOtp: (b: { email: string; otp: string }) => http.post<ApiEnvelope<null>>('/auth/verify-otp', b),
  resendOtp: (b: { email: string }) => http.post<ApiEnvelope<null>>('/auth/resend-otp', b),
  login: (b: { email: string; password: string }) =>
    http.post<ApiEnvelope<{ accessToken: string; user: User }>>('/auth/login', b),
};

export const usersApi = {
  me: () => get<User>('/users/me'),
  updateMe: (b: { firstName: string; lastName: string; profileImage?: { folder: string; name: string } | null }) =>
    http.patch<ApiEnvelope<User>>('/users/me', b),
};

export const filesApi = {
  uploadProfileImage: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return http.post<ApiEnvelope<UploadedImage>>('/files/profile-images', body);
  },
  deleteProfileImage: (name: string) => http.delete<ApiEnvelope<User>>(`/files/profile-images/${name}`),
  uploadProductImage: (file: File, productName: string) => {
    const body = new FormData();
    body.append('file', file);
    body.append('productName', productName);
    return http.post<ApiEnvelope<UploadedImage>>('/files/product-images', body);
  },
  deleteProductImage: (name: string) => http.delete<ApiEnvelope<null>>(`/files/product-images/${name}`),
};

export const shopApi = {
  myRating: (id: string) => get<{ myRating: number | null }>(`/products/${id}/my-rating`),
  rate: (id: string, rating: number) => http.put<ApiEnvelope<RatingSummary>>(`/products/${id}/rating`, { rating }),
};

export interface ProductListParams {
  page: number; pageSize: number; sortBy: string; sortOrder: 'asc' | 'desc';
  status?: string; search?: string; categoryId?: string; minPrice?: string; maxPrice?: string; minRating?: string;
  createdFrom?: string; createdTo?: string;
}
export interface ProductBody {
  name?: string; status: 'draft' | 'active' | 'deactivated';
  price: string | null; categoryId: string | null; description: string | null;
  metaTitle: string | null; metaDescription: string | null; metaKeywords: string | null;
  images: { folder: string; name: string }[];
}

export interface UserListParams {
  page: number; pageSize: number; sortBy: string; sortOrder: 'asc' | 'desc';
  status?: string; role?: string; search?: string; createdFrom?: string; createdTo?: string;
}
export const adminApi = {
  stats: () => get<DashboardStats>('/admin/stats'),
  users: (p: UserListParams) => get<User[]>('/admin/users', p),
  setStatus: (id: string, status: UserStatus) =>
    http.patch<ApiEnvelope<User>>(`/admin/users/${id}/status`, { status }),

  productStats: () => get<ProductStats>('/admin/products/stats'),
  products: (p: ProductListParams) => get<AdminProduct[]>('/admin/products', p),
  product: (id: string) => get<AdminProduct>(`/admin/products/${id}`),
  createProduct: (b: ProductBody) => http.post<ApiEnvelope<AdminProduct>>('/admin/products', b),
  updateProduct: (id: string, b: ProductBody) => http.put<ApiEnvelope<AdminProduct>>(`/admin/products/${id}`, b),
  setProductStatus: (id: string, status: ProductStatus) => http.patch<ApiEnvelope<AdminProduct>>(`/admin/products/${id}/status`, { status }),
  categories: (search?: string, limit = 20) => get<Category[]>('/admin/categories', { ...(search ? { search } : {}), limit }),
  addCategory: (name: string) => http.post<ApiEnvelope<Category>>('/admin/categories', { name }),
};
