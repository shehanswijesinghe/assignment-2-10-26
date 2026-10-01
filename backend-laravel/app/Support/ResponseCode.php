<?php

namespace App\Support;

final class ResponseCode
{
    public const AUTH_REGISTER_SUCCESS = 'auth.register.success';
    public const AUTH_LOGIN_SUCCESS = 'auth.login.success';
    public const AUTH_OTP_SENT = 'auth.otp.sent';
    public const AUTH_OTP_INVALID = 'auth.otp.invalid';
    public const AUTH_OTP_EXPIRED = 'auth.otp.expired';
    public const AUTH_OTP_RESEND_TOO_SOON = 'auth.otp.resend.too.soon';
    public const AUTH_EMAIL_VERIFIED = 'auth.email.verified';
    public const AUTH_EMAIL_ALREADY_VERIFIED = 'auth.email.already.verified';
    public const AUTH_EMAIL_NOT_VERIFIED = 'auth.email.not.verified';
    public const AUTH_ADMIN_APPROVAL_PENDING = 'auth.admin.approval.pending';
    public const AUTH_ACCOUNT_DEACTIVATED = 'auth.account.deactivated';
    public const AUTH_INVALID_CREDENTIALS = 'auth.invalid.credentials';
    public const AUTH_UNAUTHORIZED = 'auth.unauthorized';
    public const AUTH_FORBIDDEN = 'auth.forbidden';
    public const USER_NOT_FOUND = 'user.not.found';
    public const USER_EMAIL_EXISTS = 'user.email.exists';
    public const USER_FETCH_SUCCESS = 'user.fetch.success';
    public const USER_UPDATE_SUCCESS = 'user.update.success';
    public const USER_LIST_SUCCESS = 'user.list.success';
    public const USER_STATUS_UPDATE_SUCCESS = 'user.status.update.success';
    public const USER_STATUS_TRANSITION_INVALID = 'user.status.transition.invalid';
    public const USER_STATUS_PROTECTED = 'user.status.protected';
    public const ADMIN_STATS_SUCCESS = 'admin.stats.success';
    public const PRODUCT_LIST_SUCCESS = 'product.list.success';
    public const PRODUCT_FETCH_SUCCESS = 'product.fetch.success';
    public const PRODUCT_CREATE_SUCCESS = 'product.create.success';
    public const PRODUCT_UPDATE_SUCCESS = 'product.update.success';
    public const PRODUCT_STATUS_UPDATE_SUCCESS = 'product.status.update.success';
    public const PRODUCT_NOT_FOUND = 'product.not.found';
    public const PRODUCT_STATUS_TRANSITION_INVALID = 'product.status.transition.invalid';
    public const PRODUCT_INCOMPLETE = 'product.incomplete';
    public const PRODUCT_STATS_SUCCESS = 'product.stats.success';
    public const PRODUCT_RATE_SUCCESS = 'product.rate.success';
    public const PRODUCT_RATING_FETCH_SUCCESS = 'product.rating.fetch.success';
    public const PRODUCT_SITEMAP_SUCCESS = 'product.sitemap.success';
    public const CATEGORY_LIST_SUCCESS = 'category.list.success';
    public const CATEGORY_CREATE_SUCCESS = 'category.create.success';
    public const FILE_IN_USE = 'file.in.use';
    public const FILE_UPLOAD_SUCCESS = 'file.upload.success';
    public const FILE_DELETE_SUCCESS = 'file.delete.success';
    public const FILE_NOT_FOUND = 'file.not.found';
    public const PAYLOAD_TOO_LARGE = 'request.payload.too.large';
    public const HEALTH_OK = 'health.ok';
    public const VALIDATION_FAILED = 'validation.failed';
    public const REQUEST_TOO_MANY = 'request.too.many';
    public const RESOURCE_NOT_FOUND = 'resource.not.found';
    public const BAD_REQUEST = 'request.bad';
    public const INTERNAL_ERROR = 'internal.error';
}
