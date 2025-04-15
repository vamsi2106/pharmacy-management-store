/**
 * Entry point for the Pharmacy Management System React application
 */
const { StrictMode } = React;
const { createRoot } = ReactDOM;
const { BrowserRouter } = ReactRouterDOM;

// Render the React application
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
); 