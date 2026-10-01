export type UserStatus =
  | 'email_approval_pending' | 'email_approved' | 'admin_pending' | 'activated' | 'deactivated' | 'deleted';
export type Role = 'USER' | 'ADMIN';

export const USER_STATUSES: UserStatus[] = [
  'email_approval_pending', 'email_approved', 'admin_pending', 'activated', 'deactivated', 'deleted',
];

export const STATUS_TRANSITIONS: Record<UserStatus, UserStatus[]> = {
  email_approval_pending: ['deleted'],
  email_approved: ['deleted'],
  admin_pending: ['activated', 'deactivated', 'deleted'],
  activated: ['deactivated', 'deleted'],
  deactivated: ['activated', 'deleted'],
  deleted: [],
};

export type ProductStatus = 'active' | 'draft' | 'deactivated' | 'deleted';
export const PRODUCT_STATUSES: ProductStatus[] = ['active', 'draft', 'deactivated', 'deleted'];

export const PRODUCT_STATUS_TRANSITIONS: Record<ProductStatus, ProductStatus[]> = {
  draft: ['active', 'deleted'],
  active: ['deactivated', 'draft', 'deleted'],
  deactivated: ['active', 'draft', 'deleted'],
  deleted: [],
};

export const MAX_PRODUCT_IMAGES = 5;
export const OTP_TTL_SECONDS = 300;
export const HOME_BY_ROLE: Record<Role, string> = { USER: '/', ADMIN: '/admin/users/dashboard' };
