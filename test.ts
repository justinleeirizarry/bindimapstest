import axios from 'axios';
import { UserSession, Venue, VenueVisits } from './models';

// Set up API endpoints
const SESSIONS_API_URL = 'https://storage.googleapis.com/the-cms-bindimaps-v1.appspot.com/temp/codeTest2022/userSessions.json';
const VENUES_API_URL = 'https://storage.googleapis.com/the-cms-bindimaps-v1.appspot.com/temp/codeTest2022/venues.json';

// Set proximity threshold to 5 meters (in real life this would be a configurable value)
const VENUE_PROXIMITY_THRESHOLD = 5;

// Make API calls to get session and venue data
axios.all([axios.get(SESSIONS_API_URL), axios.get(VENUES_API_URL)])
    .then(axios.spread((sessionsResponse, venuesResponse) => {
        const sessions = sessionsResponse.data;
        const venues = venuesResponse.data;

        // Get the array of venue positions
        const venuePositions = venues.map((venue: Venue) => venue.position);

        // Loop over each path
        const venueVisits:VenueVisits = {};
        sessions.forEach((session: UserSession) => {
            const userId: string = session.userId; // Get the user ID from the session
            session.path.forEach(position => {
                // Loop over each venue position and check if the position is within proximity of the venue
                for (let i = 0; i < venuePositions.length; i++) {
                    const venuePosition = venuePositions[i];
                    const proximity = Math.sqrt(
                        Math.pow(position.position.x - venuePosition.x, 2) +
                        Math.pow(position.position.y - venuePosition.y, 2)
                    );
                    if (proximity <= VENUE_PROXIMITY_THRESHOLD) {
                        // If the position is within proximity of the venue, increment the number of visits 
                        const venueName = venues[i].name;
                        venueVisits[venueName] = venueVisits[venueName] || {};
                        venueVisits[venueName][userId] = (venueVisits[venueName][userId] || 0) + 1;
                    }
                }
            });
        });
        // Output the venue visit counts
        console.log(venueVisits);
    }))
    .catch(error => {
        console.error('Error retrieving data:', error);
    });

