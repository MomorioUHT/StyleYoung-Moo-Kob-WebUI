function NotFoundPage() {
    return (
        <div style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
        }}>
            <h1>404 - Page Not Found</h1>
            <img src="https://cloud.refsheet.net/images/images/001/806/098/large/Sad%E2%80%A6_Protogen.png?1698517540" height='150px' alt='protogen'/>
            <p>The page you are looking for does not exist.</p>
            <a href="/" style={{ color: "#1677ff", textDecoration: "underline" }}>Go back to Home</a>
        </div>
    );
}

export default NotFoundPage;