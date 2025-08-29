# Art-Home

A digital platform for discovering and managing art collections. This web application allows users to explore, organize, and share artwork in a personalized virtual space.

## Features

- Browse extensive art collections
- Create and manage personal galleries
- Search artwork by various filters
- User authentication and profiles
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- NPM 

## Installation

1. Clone the repository:
   
```bash
git clone https://github.com/ianJINW/Art-Home.git
cd ART-HOME
```

1. Install dependencies:
   in one terminal
  
```bash
cd client
npm install
```

in another terminal
```bash
cd server
npm install
```


1. Set up environment variables:
Create a `.env` file in the root directory and add:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_clud_name
CLOUDINARY_API_KEY=cludinary_api_key
CLOUDINARY_API_SECRET=api_key
```

1. Start the development server:
```bash
npm run dev
```

## Usage

1. Register a new account or log in
2. Browse the art collection using the search and filter options
3. Create personal galleries and add artwork
4. Manage your profile and preferences

## API Documentation

The API endpoints are available at `http://localhost:5173/api`

### Main Endpoints:

- `GET /api/artworks` - Get all artworks
- `POST /api/galleries` - Create a new gallery
- `PUT /api/users/profile` - Update user profile

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: `https://github.com/ianJINW/Art-Home`
