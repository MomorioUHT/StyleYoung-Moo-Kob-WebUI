/**
 * 404 Not Found page component
 * Displays a user-friendly error message when navigating to non-existent routes
 * 
 * @returns {JSX.Element} The 404 error page with navigation back to home
 */
function NotFoundPage() {
    const containerStyle = {
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
    };

    const linkStyle = {
        color: "#1677ff",
        textDecoration: "underline"
    };

    const protogenImageUrl = "https://cloud.refsheet.net/images/images/001/806/098/large/Sad%E2%80%A6_Protogen.png?1698517540";

    return (
        <div style={containerStyle}>
            <h1>404 - Page Not Found</h1>
            <img src={protogenImageUrl} height='150px' alt='protogen'/>
            <p>The page you are looking for does not exist.</p>
            <a href="/" style={linkStyle}>Go back to Home</a>
        </div>
    );
}

export default NotFoundPage;