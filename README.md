# ThriftX - Sustainable Fashion Marketplace

A fully functional sustainable fashion thrift store marketplace built with React and Firebase, designed for buying and selling pre-loved fashion items online. Focused on promoting circular fashion and reducing textile waste.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure registration and login system
- **Product Catalog**: Browse, search, and filter products by category
- **Shopping Cart**: Add items, manage quantities, and checkout
- **Order Management**: Track purchases and order history
- **Seller Dashboard**: Manage products, inventory, and sales
- **Product Management**: Add, edit, and delete product listings
- **Image Upload**: Support for multiple product images
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### User Roles
- **Buyers**: Browse and purchase products
- **Sellers**: List and manage products for sale
- **Admin**: (Ready for implementation) Manage the marketplace

### Technology Stack
- **Frontend**: React 18, Styled Components, React Router
- **Backend**: Firebase (Firestore, Authentication, Storage, Hosting)
- **State Management**: React Context API
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thriftx-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Storage
   - Get your Firebase configuration

4. **Configure Firebase**
   - Update `src/firebase/config.js` with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```
   - Update `.firebaserc` with your project ID

5. **Set up Firestore Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

6. **Set up Storage Security Rules**
   ```bash
   firebase deploy --only storage
   ```

7. **Start the development server**
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/                 
│   ├── page.js          # Home page (root route)
│   ├── layout.js        # Root layout shared across all routes
│   ├── globals.css      # Global styles (includes Tailwind CSS)
│   └── ...              # Additional route folders (e.g., about/, products/, etc.)
│
├── components/
│   ├── auth/            # Authentication components (Login, Signup, etc.)
│   ├── common/          # Reusable shared components (Header, Footer, Navbar, etc.)
│   ├── home/            # Components specific to the home page
│   └── products/        # Product listing and detail components
│
├── contexts/            # React Context providers for global state management
│
├── firebase/            # Firebase configuration and initialization
│
├── pages/               # Optional legacy pages (for backward compatibility)
│   ├── seller/          # Seller dashboard and related pages
│   └── ...
|
└── App.js               # Main application entry point

```

## 🔧 Configuration

### Firebase Setup

1. **Authentication**
   - Enable Email/Password authentication
   - Configure authorized domains for production

2. **Firestore Database**
   - The app uses the following collections:
     - `users` - User profiles and settings
     - `products` - Product listings
     - `orders` - Order information
     - `carts` - Shopping cart items

3. **Storage**
   - Used for storing product images
   - Organized by user ID for security

### Environment Variables (Optional)
Create a `.env` file for additional configuration:
```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

## 🚀 Deployment

### Deploy to Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase (if not done)**
   ```bash
   firebase init
   ```

4. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

Your app will be available at `https://your-project-id.web.app`

### Deploy to Other Platforms

The built files in the `build/` directory can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## 📱 Usage

### For Buyers
1. Register as a buyer
2. Browse products or search by category
3. Add items to cart
4. Checkout and complete purchase
5. Track orders in the Orders page

### For Sellers
1. Register as a seller
2. Access the seller dashboard
3. Add products with images and details
4. Manage inventory and pricing
5. Track sales and orders

## 🔐 Security

- **Authentication**: Firebase Authentication with email/password
- **Authorization**: Firestore security rules prevent unauthorized access
- **Data Validation**: Client and server-side validation
- **Image Upload**: Secure file upload to Firebase Storage

## 🎨 Customization

### Styling
- Built with Styled Components for easy customization
- Global styles in `src/styles/GlobalStyle.js`
- Responsive design with mobile-first approach

### Adding Features
- **Payment Integration**: Ready for Stripe integration
- **Admin Panel**: Structure in place for admin features
- **Reviews & Ratings**: Can be added to product schema
- **Messaging**: Seller-buyer communication system

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Configuration**
   - Ensure all Firebase services are enabled
   - Check security rules are deployed
   - Verify API keys and project ID

2. **Build Issues**
   - Clear node_modules and reinstall
   - Check for version conflicts
   - Ensure all dependencies are installed

3. **Deployment Issues**
   - Verify Firebase CLI is logged in
   - Check build directory exists
   - Ensure firebase.json is configured correctly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🆘 Support

For support, please:
1. Check the troubleshooting section
2. Review Firebase documentation
3. Create an issue on GitHub

## 🔄 Future Enhancements

- [ ] Payment integration with Stripe
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search with filters
- [ ] Real-time chat between buyers and sellers
- [ ] Analytics dashboard for sellers
- [ ] Mobile app with React Native
- [ ] Multi-language support
- [ ] Advanced admin panel

---

Built with ❤️ using React and Firebase
