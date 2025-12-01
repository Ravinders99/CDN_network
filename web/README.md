# CDN Video Streaming Web Client

A modern, responsive web client for the CDN video streaming platform with Netflix-style interface and comprehensive functionality.

## Features

### 🎥 Video Library
- **Dynamic video discovery** from CDN replicas
- **Grid layout** with responsive design
- **Video thumbnails** with gradient placeholders
- **Metadata display** (duration, size, quality)
- **Search and filter** capabilities

### 🎬 Enhanced Video Player
- **HLS.js integration** for adaptive streaming
- **Custom controls** with modern styling
- **Picture-in-Picture** support
- **Fullscreen mode** with keyboard shortcuts
- **Error handling** with retry functionality

### 🌟 User Experience
- **Favorites system** with local storage
- **Recently watched** history
- **Search functionality** with real-time filtering
- **Dark/Light theme** toggle
- **Toast notifications** for user feedback
- **Keyboard shortcuts** for accessibility

### 📱 Responsive Design
- **Mobile-first** approach
- **Flexible grid** layout
- **Touch-friendly** controls
- **Accessibility** features

## File Structure

```
web/
├── app.html          # Main application HTML
├── styles.css        # Modern CSS with dark/light themes
├── app.js           # JavaScript application logic
├── index.html       # Original simple player (backup)
└── README.md        # This documentation
```

## Usage

### Quick Start
1. Open `app.html` in a modern web browser
2. Ensure CDN services are running (controller + replicas)
3. Browse the video library and click to play

### Keyboard Shortcuts
- `Space` - Play/Pause video
- `F` - Toggle fullscreen
- `Escape` - Close player/modals
- `/` - Focus search input

### Browser Requirements
- **Modern browsers** with ES6+ support
- **HLS.js compatible** (Chrome, Firefox, Safari, Edge)
- **HTTPS support** for CDN streaming

## Technical Implementation

### Video Discovery
The application automatically discovers available videos from CDN replicas:

```javascript
// Auto-discovery from replica health endpoints
const replicas = [
    'https://localhost:8101',
    'https://localhost:8102',
    'https://localhost:8103'
];
```

### HLS Streaming
Utilizes HLS.js for adaptive video streaming:

```javascript
// HLS configuration
const hls = new Hls({
    debug: false,
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 90
});
```

### Local Storage
Persists user preferences and history:

- `favorites` - User's favorite videos
- `recentlyWatched` - Recently played videos
- `theme` - Dark/light theme preference

### Error Handling
Comprehensive error handling with user-friendly messages:

- Network connectivity issues
- Video loading failures
- CDN replica unavailability
- Browser compatibility problems

## API Integration

### Controller Integration
```javascript
// Video playback via controller
const videoUrl = `https://localhost:8000/play/${videoId}`;
```

### Replica Health Checks
```javascript
// Health monitoring
const healthCheck = await fetch(`${replica}/health`);
```

## Customization

### Theming
The application supports custom themes via CSS variables:

```css
:root {
    --primary-color: #e50914;
    --background-dark: #141414;
    --text-primary: #ffffff;
    /* ... more variables */
}
```

### Video Metadata
Customize video information in the `createVideoObject()` method:

```javascript
createVideoObject(id) {
    return {
        id: id,
        title: this.generateVideoTitle(id),
        description: 'Custom description',
        // ... more metadata
    };
}
```

## Performance Optimization

### Lazy Loading
- Progressive video library loading
- On-demand thumbnail generation
- Efficient DOM manipulation

### Caching Strategy
- Browser cache for static assets
- LocalStorage for user data
- HLS segment caching

### Mobile Optimization
- Touch-optimized controls
- Responsive breakpoints
- Reduced motion support

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 60+     | ✅ Full Support |
| Firefox | 55+     | ✅ Full Support |
| Safari  | 12+     | ✅ Full Support |
| Edge    | 79+     | ✅ Full Support |

## Security Considerations

### HTTPS Requirement
- All CDN communication over HTTPS
- Self-signed certificates for development
- CSP headers recommended for production

### Input Validation
- Search query sanitization
- XSS prevention
- Safe DOM manipulation

## Future Enhancements

### Planned Features
- [ ] Video upload interface
- [ ] User authentication
- [ ] Playlist management
- [ ] Video analytics
- [ ] Quality selector
- [ ] Subtitle support
- [ ] Social sharing
- [ ] Offline viewing

### Technical Improvements
- [ ] Service Worker for offline support
- [ ] WebRTC for live streaming
- [ ] Progressive Web App (PWA)
- [ ] Advanced caching strategies
- [ ] Performance monitoring

## Troubleshooting

### Common Issues

**Video Won't Play**
- Check CDN services are running
- Verify SSL certificates are trusted
- Check browser console for errors

**Library Won't Load**
- Ensure replica services are accessible
- Check network connectivity
- Verify CORS configuration

**Styling Issues**
- Clear browser cache
- Check CSS file loading
- Verify font imports

### Debug Mode
Enable debug logging by opening browser console and running:

```javascript
app.debugMode = true;
```

## Contributing

### Development Setup
1. Clone repository
2. Start CDN services
3. Open `app.html` in browser
4. Make changes and test

### Code Style
- ES6+ JavaScript
- CSS custom properties
- Mobile-first responsive design
- Semantic HTML structure

---

*For more information about the CDN infrastructure, see `CDN_ARCHITECTURE_DOCUMENTATION.md`*