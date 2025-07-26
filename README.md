# PetraVerse - Pet Adoption Platform

## Introduction

PetraVerse is a comprehensive pet adoption and lost & found platform designed to help pet owners find their missing pets and connect people with pets in need of adoption. The platform serves as a bridge between pet owners, shelters, veterinarians, and the community to ensure pets find their forever homes or are reunited with their families.

## Problem Statement

Every year, millions of pets go missing, and many more are in need of adoption. Traditional methods of finding lost pets or adopting new ones are often inefficient and limited to local communities. PetraVerse addresses these challenges by providing:

- A centralized platform for lost and found pet listings
- Easy communication between pet owners and finders
- Comprehensive pet profiles with detailed information
- Location-based search capabilities
- Professional verification and reporting systems

## Main Features

### 🏠 **User Management**
- User registration and authentication
- Profile management with contact information
- Role-based access (User, Admin, Shelter, Veterinarian)
- Password reset and email verification

### 🐕 **Pet Management**
- Create detailed pet profiles with photos
- Support for multiple pet types (dogs, cats, birds, rabbits, hamsters, fish, others)
- Track pet status (missing, found, reunited)
- Location-based pet search
- Pet adoption listings

### 🔍 **Search & Discovery**
- Advanced search filters by location, pet type, breed, color
- Map-based location tracking
- Real-time notifications for matching pets
- Browse pets by category and status

### 📱 **Communication System**
- In-app messaging between users
- Email notifications for important updates
- Real-time status updates
- Contact information sharing

### 🛡️ **Safety & Verification**
- Report suspicious listings
- Admin moderation system
- User verification processes
- Community guidelines enforcement

### 📊 **Admin Dashboard**
- User management and moderation
- Pet listing oversight
- Report handling and resolution
- Platform analytics and insights

## How to Use PetraVerse

### Getting Started

1. **Create an Account**
   - Visit the registration page
   - Fill in your name, email, phone number, and address
   - Choose a strong password
   - Verify your email address

2. **Complete Your Profile**
   - Add a profile picture
   - Update your contact information
   - Set your location preferences

### Finding a Lost Pet

1. **Search for Your Pet**
   - Go to the Search page
   - Use filters to narrow down results by location, pet type, breed, or color
   - Browse through matching pet listings

2. **Report a Missing Pet**
   - Click "Create Pet Listing"
   - Select "Missing" status
   - Upload clear photos of your pet
   - Provide detailed information (name, breed, color, age, last seen location)
   - Add any identifying features or special characteristics

3. **Stay Updated**
   - Enable notifications to receive alerts about potential matches
   - Regularly check your dashboard for updates
   - Respond promptly to any leads

### Finding a Pet to Adopt

1. **Browse Available Pets**
   - Visit the Search page
   - Filter by "Found" or "Available for Adoption" status
   - Use location filters to find pets near you

2. **Review Pet Details**
   - Read the complete pet profile
   - Check photos and descriptions
   - Review the pet's history and health information

3. **Contact the Owner/Shelter**
   - Use the contact information provided
   - Ask questions about the pet's behavior and needs
   - Arrange a meeting if interested

### Reporting Found Pets

1. **Create a Found Pet Listing**
   - Click "Create Pet Listing"
   - Select "Found" status
   - Upload photos of the found pet
   - Provide location and date found
   - Add any identifying features

2. **Help with Reunion**
   - Respond to inquiries from potential owners
   - Verify ownership through photos or identifying features
   - Update the listing status when reunited

### Admin Features

1. **User Management**
   - Monitor user accounts and activity
   - Handle verification requests
   - Manage user roles and permissions

2. **Content Moderation**
   - Review reported listings
   - Remove inappropriate content
   - Enforce community guidelines

3. **Platform Analytics**
   - View adoption success rates
   - Monitor user engagement
   - Track platform growth

## Technologies Used

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React Router** - Client-side routing for single-page applications
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling with validation
- **Axios** - HTTP client for API requests
- **Framer Motion** - Animation library for smooth transitions
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling tool
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing for security
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage and management
- **Nodemailer** - Email sending functionality
- **Swagger** - API documentation

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **TypeScript ESLint** - TypeScript-specific linting rules

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd petAdoption/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_SERVICE=your_email_service
   EMAIL_USER=your_email_username
   EMAIL_PASS=your_email_password
   CORSWHITELIST=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Database Setup

1. **MongoDB Connection**
   - Set up a MongoDB database (local or MongoDB Atlas)
   - Update the `MONGODB_URI` in your backend `.env` file

2. **Create Admin User**
   ```bash
   cd backend
   node scripts/createAdmin.js
   ```

## API Documentation

The API documentation is available at `/api-docs` when the backend server is running. It includes:

- Authentication endpoints
- Pet management endpoints
- User management endpoints
- Admin endpoints
- Notification endpoints
- Report endpoints

## Deployment

### Backend Deployment (Vercel)
The backend is configured for deployment on Vercel with the provided `vercel.json` configuration.

### Frontend Deployment (Vercel)
The frontend is configured for deployment on Vercel with the provided `vercel.json` configuration.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation


# Preview of the App Interface 
![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-2025-07-26-15_31_11.png)
Landing page of the app

![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-register-2025-07-26-15_31_38.png)
Registration page

![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-login-2025-07-26-15_31_24.png)
Login Page

![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-forgot-password-2025-07-26-15_31_49.png)
Forgot Password page

![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-dashboard-2025-07-26-15_28_23.png)
User dashboard before posting 

![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-dashboard-2025-07-26-15_30_03%20(1).png)
User dashboard after posting

![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-pets-create-2025-07-26-15_28_39.png)
Post creation page for user


![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-notifications-2025-07-26-15_30_16.png)
User notification page

![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-profile-2025-07-26-15_30_42.png)

User profile page

![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-profile-2025-07-26-15_30_57.png)
Logout toggle for user


![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-admin-dashboard-2025-07-26-15_32_24.png)
Admin panel/dashboard

![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-admin-pets-2025-07-26-15_32_51.png)
Pet management page (admin)

![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-admin-reports-2025-07-26-15_34_31%20(1).png)
Report Management Page (admin)

![screenshot](/frontend/public/screenshot/screencapture-petra-verse-vercel-app-admin-users-2025-07-26-15_34_12.png)
User Management Page (admin)





## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**PetraVerse** - Connecting pets with their forever homes, one adoption at a time. 🐾 