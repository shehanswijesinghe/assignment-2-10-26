## Authentication Approach

I have planned the project using a **JWT-based authentication model**. The application maintains two roles: **Admin** and **User**.

The backend uses the `firebase/php-jwt` library to sign and verify JWTs. The signing algorithm is **HS256**. On the frontend, the JWT is maintained in the application state and sent with authenticated requests using the `Bearer` token.

### Admin

The initial Admin user is created automatically through a database migration. However, this is not the best practice for a production application. A better approach would be to implement a dedicated **initial Admin setup feature**.

The Admin can:

* Access the Admin Dashboard.
* Manage users:

    * Approve users.
    * Activate users.
    * Deactivate users.
    * Delete users.
* Manage products:

    * Add products.
    * Edit products.
    * Change product status.
* Edit their own profile.

### User

A user must register through the `/register` registration form.

If the backend email configuration is correctly configured, the system will send an email containing an OTP. The user must verify the OTP to complete the registration process.

If email configuration is not available during development, the OTP can be obtained from the backend logs.

After completing registration, the user cannot log in immediately because the account requires **Admin approval**.

The process is:

1. The user registers through `/register`.
2. The user verifies the OTP.
3. The account remains pending Admin approval.
4. The Admin logs in and approves the user.
5. The user can then log in.
6. The user can browse the product list using SSR.
7. The user can view individual product details using SSR.
8. The user can submit ratings for products.

### Frontend Authentication and State Management

The frontend uses **Zustand** for state management.

Zustand maintains the JWT token and authenticated user data in memory. Axios is used to manage communication with the backend.

For every authenticated API request, Axios automatically includes the JWT as a Bearer token in the `Authorization` header:

```text
Authorization: Bearer <JWT_TOKEN>
```

If the backend returns an **Unauthorized (401)** response, the frontend clears the authentication state and redirects the user to the login page.

### Backend JWT Authentication

The backend uses the `JwtAuth` middleware to protect authenticated routes.

The middleware extracts the JWT from the request and passes it to the JWT service. `JWT::decode()` verifies the token using the configured secret and the **HS256** algorithm.

If the JWT has an invalid signature or has expired, the request is rejected.

The authentication process works as follows:

1. The middleware validates the JWT.
2. It retrieves the user's ID from the token's `sub` claim.
3. It looks up the user in the database.
4. The user's current database status must be `Activated`.
5. If the user is not activated, the request is rejected.
6. If the token and user are valid, the authenticated user is attached to the request.
7. Controllers can access the authenticated user using `$request->user()`.
8. Admin routes separately check the user's current database role.
9. If the authenticated user does not have the required Admin role, the API returns `403 Forbidden` with specific code.
10. If the API returns `401 Unauthorized` with specific code, the frontend clears the authentication state and redirects the user to the login page.

This approach ensures that the JWT is used for authentication while the user's **current status and role are verified against the database**.


Here is a corrected and better-ordered version, keeping your technical approach and meaning:

## Image Handling Approach

The application has two main types of images:

* **Profile images**
* **Product images**

Due to the issues and constraints around using external image storage, I did not use **AWS S3 or another third-party image storage service**. Instead, I implemented a dedicated **backend image/file management service**.

The backend service provides functionality similar to an object storage service such as S3, including file storage, generated file names, file references, and public URLs for accessing stored images.

### Product Image Upload

Product images are managed through an image-upload wizard on the frontend.

The process works as follows:

1. The frontend validates the image **type and file size** before uploading.
2. The supported image formats are **JPEG, PNG, and WebP**.
3. The maximum file size is currently **2 MB**, but this limit can be changed through configuration.
4. Each image is sent individually as `multipart/form-data` to:

```text
POST /files/product-images
```

The request includes the image file and the `productName`.

5. The backend validates the uploaded file and saves it to the configured storage disk using a **generated file name**.
6. The backend returns an image reference containing:

  * `baseUrl`
  * `folder`
  * `name`
  * A ready-to-use image URL

The frontend keeps this image reference in its state and uses the returned URL to display an image preview.

### Image Ordering

The image-upload wizard also allows the user to **reorder product images**.

The first image in the list is considered the **main product image**.

When the product is saved, the frontend sends the image references along with the product data, and those references are stored in the database.

### Retrieving Images

Once an image needs to be displayed, the frontend can use the stored image reference or URL.

The following endpoint is publicly accessible:

```text
GET /api/files/{path}
```

Authentication is not required to retrieve an image, so users do not need to log in just to view publicly available product or profile images.

### Product Images in the Shop

Product images are automatically displayed in the shop when an **active product** contains a reference to the corresponding image.

This keeps image storage and image retrieval separated from the product management logic while providing an image-management flow similar to a basic object-storage service.


## Key Architectural Decisions

**Backend:** Business logic is separated from HTTP handling. Routes map to controllers, while services handle authentication, products, admin operations, profiles, mail, and storage. Enums represent roles and account/product statuses.

**API responses use a shared contract.** Responses carry success/error codes and structured validation details rather than relying on message text. Request IDs and centralized error handling support consistent client behavior and logging. Response codes are synchronized between the frontend and backend.

**File storage is behind an abstraction.** The default disk is local, and the configured storage service also supports an S3-compatible disk. This keeps upload and retrieval logic separate from product/profile features.
