# API

Base URL: `http://localhost:4000/api`. Auth: `Authorization: Bearer <accessToken>` (except **Public** routes).

## Endpoints
| Method | Path | Access | Body / query | Success code |
|---|---|---|---|---|
| GET | `/health` | Public | - | `health.ok` |
| POST | `/auth/register` | Public | `firstName,lastName,email,password` (no image here) | `auth.register.success` (201) |
| POST | `/auth/verify-otp` | Public | `email,otp(6 digits)` | `auth.email.verified` |
| POST | `/auth/resend-otp` | Public | `email` | `auth.otp.sent` |
| POST | `/auth/login` | Public | `email,password` -> `{accessToken,user}` | `auth.login.success` |
| GET | `/users/me` | Activated user | - | `user.fetch.success` |
| PATCH | `/users/me` | Activated user | `firstName,lastName` and optional `profileImage` (see below); other keys rejected | `user.update.success` |
| POST | `/files/profile-images` | Activated user | multipart `file` (JPEG/PNG/WebP, <= 2048 KB) | `file.upload.success` (201) |
| GET | `/files/{folder}/{name}` | Public | - | image bytes |
| DELETE | `/files/profile-images/{name}` | Activated user (own files) | - | `file.delete.success` |
| POST | `/files/product-images` | ADMIN | multipart `file` + `productName` | `file.upload.success` (201) |
| DELETE | `/files/product-images/{name}` | ADMIN | - (only images not attached to a product, else `file.in.use`) | `file.delete.success` |
| GET | `/admin/stats` | ADMIN | - | `admin.stats.success` |
| GET | `/admin/users` | ADMIN | `page,pageSize(<=100),sortBy,sortOrder,status,role,search,createdFrom,createdTo` | `user.list.success` |
| PATCH | `/admin/users/:id/status` | ADMIN | `status: activated\|deactivated\|deleted` | `user.status.update.success` |

## Shop and product endpoints
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/products` | Public | Query: `page`, `pageSize` (<= 48, default 12), `search` (name), `categoryId`, `minPrice`, `maxPrice`, `minRating`, `sortBy` (`createdAt`\|`price`\|`rating`\|`name`), `sortOrder`. Returns cards: `id, slug, name, price, category, ratingAvg, ratingCount, image` + `meta` |
| GET | `/products/{slug}` | Public | Detail: card + `description, images[], metaTitle, metaDescription, metaKeywords, createdAt, updatedAt` |
| GET | `/categories` | Public | Categories that have active products, with `productCount` |
| GET | `/sitemap/products` | Public | `[{slug, updatedAt}]` (max 5000) for the sitemap |
| GET | `/products/{id}/my-rating` | Signed in | `{myRating: 1-5 \| null}` |
| PUT | `/products/{id}/rating` | Signed in | `{rating: 1-5}` -> `{ratingAvg, ratingCount, myRating}`. One rating per user and product; rating again replaces it |

### Admin (role ADMIN)
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/products/stats` | Product dashboard numbers (counts by status/category, ratings, top rated, latest) |
| GET | `/admin/products` | Query as above plus `status`, `createdFrom`, `createdTo`; `pageSize` <= 100; `sortBy` `name\|price\|rating\|status\|createdAt\|updatedAt`. Deleted products are hidden unless `status=deleted` |
| GET | `/admin/products/{id}` | Full product including `status` (drafts too) |
| POST | `/admin/products` | Create |
| PUT | `/admin/products/{id}` | Update (same body, **without `name`**: the name is immutable and sending it fails with `validation.key.unrecognized`) |
| PATCH | `/admin/products/{id}/status` | `status: active\|draft\|deactivated\|deleted`, subject to the transition table |
| GET | `/admin/categories` | `search`, `limit` (<= 50); for the searchable picker |
| POST | `/admin/categories` | `{name}`; returns the existing category if that name already exists, otherwise creates it |


## Response codes
In `backend-laravel/app/Support/ResponseCode.php`;
defined in `frontend/src/lib/i18n/`.

| Code | HTTP | Meaning |
|---|---|---|
| auth.register.success | 201 | Account created, OTP sent |
| auth.otp.sent | 200 | OTP (re)sent - shown as *info* |
| auth.otp.invalid / auth.otp.expired | 400 | Wrong / expired OTP |
| auth.otp.resend.too.soon | 429 | Resend inside cooldown |
| auth.email.verified | 200 | Email approved, now `admin_pending` |
| auth.email.already.verified | 409 | OTP flow no longer applicable |
| auth.email.not.verified | 403 | Login before OTP verification |
| auth.admin.approval.pending | 403 | Login before admin approval - shown as *info* |
| auth.account.deactivated | 403 | Deactivated account |
| auth.invalid.credentials | 401 | Wrong email/password, or deleted user |
| auth.unauthorized / auth.forbidden | 401 / 403 | Missing/invalid token / wrong role |
| user.not.found | 404 | Unknown user id |
| user.email.exists | 409 | Duplicate registration |
| user.status.transition.invalid | 409 | Disallowed status change |
| user.status.protected | 403 | Admin accounts can't be changed |
| file.upload.success / file.delete.success | 201 / 200 | Image stored / deleted |
| file.not.found | 404 | No such image (or not yours, for delete) |
| file.in.use | 409 | Product image is attached to a product |
| product.create.success / product.update.success | 201 / 200 | Product saved |
| product.status.update.success | 200 | Product status changed |
| product.not.found | 404 | Unknown, inactive (for the public API) or deleted product |
| product.status.transition.invalid | 409 | Disallowed product status change |
| product.incomplete | 409 | Publishing needs a price and at least one image |
| product.rate.success | 200 | Rating saved |
| category.create.success | 201 / 200 | Category added (200 = it already existed) |
| product.list/fetch/stats/rating.fetch/sitemap.success, category.list.success | 200 | Read operations |
| request.payload.too.large | 413 | Upload beyond the server limit |
| validation.failed | 400 | Validation failed; see `details` |
| request.too.many | 429 | Throttled |
| request.bad | 4xx | Other client errors (e.g. 405) |
| internal.error | 500 | Unexpected |
| health.ok | 200 | Health check |
Also defined for future use: `item.not.found`, `item.update.success` (frontend messages exist, no endpoint yet).

## Validation error codes
| Code | params | Meaning / example |
|---|---|---|
| validation.required | - | Missing, null or blank |
| validation.type.invalid | - | Wrong type |
| validation.email.invalid | - | Not a valid email address |
| validation.string.min / .max | `min` / `max` | Text too short / long (password 8-72, names <= 100, email <= 255) |
| validation.number.min / .max | `min` / `max` | Number out of range (`page` >= 1, `pageSize` 1-100) |
| validation.enum.invalid | - | Not an allowed value (`sortBy`, `status`, `role`...) |
| validation.date.invalid | - | Not a valid date |
| validation.password.lowercase / .uppercase / .number | - | Password composition |
| validation.otp.format | - | OTP is not exactly 6 digits |
| validation.key.unrecognized | - | Unknown property sent (bodies are strict) |
| validation.file.invalid | - | Not a usable uploaded file |
| validation.file.type | - | Not JPEG/PNG/WebP (checked on content, not file name) |
| validation.file.max | `max` (KB) | Image too large |
| validation.image.invalid | - | `profileImage` does not reference one of your uploaded images |
| validation.number.decimals | - | More than 2 decimal places (price) |
| validation.reference.invalid | - | Referenced record does not exist (`categoryId`) |
| validation.images.required | - | A non-draft product needs at least one image |
| validation.images.max | `max` | More than 5 product images |
| validation.invalid | - | Fallback for a rule without a dedicated code |
