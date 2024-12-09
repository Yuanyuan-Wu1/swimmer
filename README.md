# Swimmer Training System

A comprehensive web application for managing swimming training and competitions.

## Project Structure

```
swimmer/
├── frontend/           # React frontend application
│   ├── public/        # Static files
│   ├── src/           # Source code
│   │   ├── components/# React components
│   │   ├── pages/     # Page components
│   │   ├── services/  # API services
│   │   └── utils/     # Utility functions
│   └── package.json   # Frontend dependencies
│
├── backend/           # Node.js backend application
│   ├── src/          # Source code
│   │   ├── routes/   # API routes
│   │   ├── models/   # Database models
│   │   ├── controllers/# Route controllers
│   │   └── middleware/# Custom middleware
│   ├── config/       # Configuration files
│   ├── tests/        # Test files
│   └── package.json  # Backend dependencies
│
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd swimmer
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Create .env file in backend directory
```
MONGODB_URI=mongodb://localhost/swimmer
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Features

- User authentication and authorization
- Personal profile management
- Training record tracking
- Competition management
- Performance analytics
- Medal system
- Real-time data visualization

## Technologies Used

### Frontend
- React
- Ant Design
- Chart.js
- Axios

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
