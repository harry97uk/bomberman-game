// Define your routes and corresponding handlers
const routes = [
  { path: "/", handler: () => showPage("Home") },
  { path: "/about", handler: () => showPage("About") },
  { path: "/contact", handler: () => showPage("Contact") },
  // Add more routes as needed
];

// Function to show the content for a specific page
function showPage(pageName) {
  const content = document.getElementById("content");
  content.innerHTML = `<h1>${pageName}</h1>`;
}

// Function to handle route changes
function handleRoute() {
  const currentPath = window.location.pathname;

  // Find a matching route
  const matchingRoute = routes.find((route) => route.path === currentPath);

  if (matchingRoute) {
    // Execute the handler for the matching route
    matchingRoute.handler();
  } else {
    // Handle 404 - Page not found
    showPage("404 - Page not found");
  }
}

const GoTo = (path) => {
  window.onpop;
};
