# Dog Gallery - SBA 308A JavaScript Web Application

A single-page web application that allows users to browse, favorite, and vote on dog images using The Dog API.

## Features

- **Browse Random Dogs**: View a gallery of random dog images with breed information
- **Load More**: Paginated gallery with "Load More" functionality
- **Favorites System**: Add/remove images to/from your personal favorites
- **Voting System**: Vote up or down on dog images
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox, Grid, and responsive design
- **JavaScript (ES6+)**: Modular code with async/await and Promises
- **The Dog API**: External API for dog images, favorites, and voting
- **Fetch API**: For making HTTP requests to the API

## Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── app.js             # Main application logic
├── api.js             # API communication module
├── ui.js              # DOM manipulation and UI updates
└── README.md          # This file
```

## API Integration

This application uses The Dog API (https://thedogapi.com/) with the following endpoints:

- `GET /v1/images/search` - Fetch random dog images
- `GET /v1/favourites` - Get user's favorite images
- `POST /v1/favourites` - Add image to favorites
- `DELETE /v1/favourites/{id}` - Remove from favorites
- `POST /v1/votes` - Vote on an image

## Setup Instructions

### Option 1: Simple (Recommended)
1. Clone or download this repository
2. Open `index.html` directly in a modern web browser

### Option 2: With npm (Development)
1. Clone or download this repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start the development server
4. Open `http://localhost:3000` in your browser

### Option 3: Python Server
1. Make sure Python is installed
2. Run `python -m http.server 8000` in the project directory
3. Open `http://localhost:8000` in your browser

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Features Implemented

✅ **Fetch API Usage**: Communicates with external Dog API
✅ **User Interaction**: Search breeds, paginated galleries, voting, favorites
✅ **Data Manipulation**: POST/PUT/PATCH requests for favorites, votes, and uploads
✅ **Promises & Async/Await**: All API calls use modern async patterns
✅ **Modular Code**: Separated into 3+ modules (api.js, ui.js, app.js)
✅ **Event Loop Management**: Proper async handling without race conditions
✅ **Engaging UI**: Modern, responsive design with smooth animations
✅ **Error Handling**: Graceful error handling with user feedback
✅ **Git Commits**: Frequent commits throughout development
✅ **README**: Comprehensive documentation

## Development Notes

- The application uses ES6 modules for code organization
- All API calls include proper error handling
- The UI is fully responsive and works on mobile devices
- Images are lazy-loaded for better performance
- Modal views provide detailed image information
- Favorites and votes persist through API calls

## Future Enhancements

- User authentication and personal accounts
- Advanced search filters (size, temperament, etc.)
- Image editing and cropping before upload
- Social features (sharing, comments)
- Offline support with service workers
- Progressive Web App (PWA) capabilities

## License

This project is created for educational purposes as part of the Per Scholas SBA 308A assessment.