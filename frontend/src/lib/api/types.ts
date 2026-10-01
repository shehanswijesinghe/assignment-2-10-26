import type { ProductStatus, Role, UserStatus } from '@/lib/constants';

export interface ValidationDetail { field: string; code: string; params?: Record<string, string | number> }

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  code: string;
  data: T | null;
  meta?: { page: number; pageSize: number; total: number; totalPages: number };
  details?: ValidationDetail[];
}

export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    public details?: ValidationDetail[],
    public requestId?: string,
  ) {
    super(code);
  }
}

export interface ProfileImage { baseUrl: string; folder: string; name: string }
export interface UploadedImage extends ProfileImage { url: string; size: number; contentType: string }

export interface User {
  id: string; email: string; firstName: string; lastName: string;
  role: Role; status: UserStatus; profileImage: ProfileImage | null; createdAt: string; updatedAt: string;
}
export interface DashboardStats {
  totalUsers: number; byStatus: Record<UserStatus, number>;
  registeredLast7Days: number; registeredLast30Days: number;
  registrationsPerDay: { date: string; count: number }[]; recentUsers: User[];
}

export interface Category { id: string; name: string; productCount?: number }

export interface ProductCard {
  id: string; slug: string; name: string; price: number | null;
  category: { id: string; name: string } | null;
  ratingAvg: number; ratingCount: number; image: ProfileImage | null;
}
export interface ProductDetail extends ProductCard {
  description: string | null; images: ProfileImage[];
  metaTitle: string | null; metaDescription: string | null; metaKeywords: string | null;
  createdAt: string; updatedAt: string;
}
export interface AdminProduct extends ProductDetail { status: ProductStatus }

export interface ProductStats {
  totalProducts: number; byStatus: Record<ProductStatus, number>;
  createdLast7Days: number; createdLast30Days: number; totalRatings: number; averageRating: number;
  byCategory: { category: string | null; count: number }[];
  topRated: AdminProduct[]; recent: AdminProduct[];
}
export interface RatingSummary { ratingAvg: number; ratingCount: number; myRating: number }
