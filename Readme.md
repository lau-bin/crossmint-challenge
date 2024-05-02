# Crossmint Challenge Project
## Setup
1. Run `npm install`
## Usage
### Build Megaverse
1. Run `npm run build-megaverse`  

This option like the others throttles API calls to prevent errors. 
### Clean Megaverse
1. Run `npm run clean-megaverse`  

It uses a web scraper to load the curent Megaverse and reduce cleaning time by skipping space
## Test
1. Run `npm test`  

Tests are made with Jest, they currently test Business Logic

## Troubleshotting
Errors and other logs are stored in error.log and combined.log with timestamps.

### Debugging
1. Make sure all dev dependencies are installed
2. Run `npm run debug-build`, this will generate source maps in the build dir.  

This will set the project ready to be debugged, extra configuration may be needed depending on your IDE

## Author
Lautaro Cutri