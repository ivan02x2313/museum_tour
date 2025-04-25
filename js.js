// --- DOM Element References ---
const exteriorContainer = document.getElementById('exterior-container');
const panoContainer = document.getElementById('pano-container');
const panorama = document.getElementById('panorama');
const hotspotsContainer = document.getElementById('hotspots');
const infoPanel = document.getElementById('info-panel');
const infoTitleElement = document.getElementById('info-title');
const infoImageElement = document.getElementById('info-image');
const infoImagesMultiContainer = document.getElementById('info-images-multi');
const infoDescriptionElement = document.getElementById('info-description');
const navigationBar = document.getElementById('navigation-bar');
// Re-query navButtons after adding new ones dynamically (or ensure they are added before this 
script runs)
const navButtons = navigationBar.querySelectorAll('button[data-view]');
// --- State Variables ---
let currentHotspots = []; // Holds hotspots for the current view
let historyStack = [];
// Tracks navigation history for the back button
let isTransitioning = false;
// Flag to prevent multiple transitions at once
const TRANSITION_DURATION = 500;
// ms, matches CSS opacity transition
// --- Core Functions ---
/**
 * @function startVirtualTour
 * @description Hides the exterior view, shows the panorama view, and loads the initial panorama.
 */
function startVirtualTour() {
 if (isTransitioning) return;
 isTransitioning = true;
 historyStack = [];
 // Clear history when starting
 exteriorContainer.style.opacity = '0'; // Fade out exterior
 setTimeout(() => {
  exteriorContainer.style.display = 'none';
  panoContainer.style.display = 'block'; // Show panorama container
  navigationBar.style.display = 'block'; // Show navigation
  // Set initial panorama state (hidden)
  panorama.style.opacity = '0';
  panorama.style.transform = 'scale(1.2)'; // Start slightly zoomed for entry effect
  // Load the first view (Spoliarium Hall)
  loadPanoramaInternal('spol.jpg', getHotspotsSpolariumHall());
  updateActiveNavButton('spol.jpg');
  // Short delay before fade-in and zoom-in animation
  setTimeout(() => {
   panorama.style.opacity = '1';
   panorama.style.transform = 'scale(1)';
   isTransitioning = false; // End transition after animation
  }, 50); // Small delay to allow initial styles to apply
 }, 1000);
 // Wait for exterior fade-out
}
/**
 * @function loadPanoramaInternal
 * @description Loads the specified panorama image and its hotspots WITHOUT adding to history or 
 triggering animations itself.
 * @param {string} imageName - The filename of the panorama image.
 * @param {Array} hotspots - An array of hotspot objects for this view.
 */
function loadPanoramaInternal(imageName, hotspots) {
 panorama.src = imageName; // Set the image source
 // Ensure hotspots is an array before assigning
 currentHotspots = Array.isArray(hotspots) ?
  hotspots : [];
 renderHotspots(); // Display the hotspots (initially hidden if animating)
 closeInfoPanel();
 // Ensure info panel is closed when changing views
 console.log(`Loaded view: ${imageName}`);
}
/**
 * @function handleNavClick
 * @description Handles clicks on navigation buttons and hotspots, initiating transitions.
 * @param {string} imageName - The filename of the new panorama image to load.
 * @param {Function |
 * Array} hotspotsSource - Function or array for the target hotspots.
 * @param {string} [transitionType='fade'] - Type of transition ('fade', 'slideLeft', 'slideRight').
 */
function handleNavClick(imageName, hotspotsSource, transitionType = 'fade') {
 if (isTransitioning) return; // Prevent overlapping transitions
 const currentImageSrc = panorama.getAttribute('src');
 const currentImageFilename = currentImageSrc ?
  currentImageSrc.substring(currentImageSrc.lastIndexOf('/') + 1) : null;
 // Don't transition if clicking the current view's button
 if (currentImageFilename === imageName) return;
 isTransitioning = true;
 hotspotsContainer.classList.add('hidden'); // Hide hotspots during transition
 // --- Determine Exit Animation ---
 let exitClass = 'pano-exit-fade';
 if (transitionType === 'slideLeft') exitClass = 'pano-exit-slide-left';
 if (transitionType === 'slideRight') exitClass = 'pano-exit-slide-right';
 // --- Determine Enter Animation ---
 let enterClass = 'pano-enter-fade';
 // Reverse slide direction for entry
 if (