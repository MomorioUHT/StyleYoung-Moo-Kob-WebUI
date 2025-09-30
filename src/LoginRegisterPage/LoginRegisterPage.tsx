import { useState, useEffect } from "react";
import "./LoginRegisterPage.css";

interface EmojiItem {
  emoji: string;
  style: React.CSSProperties;
}

function App() {
  const [activeTab, setActiveTab] = useState("login");
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);

  useEffect(() => {
    const emojiList = ["🐷","🥓"];
    const tempEmojis: EmojiItem[] = [];

    for (let i = 0; i < 30; i++) {
      const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
      const style: React.CSSProperties = {
        left: Math.random() * 100 + "vw",
        animationDuration: 5 + Math.random() * 10 + "s",
        fontSize: 12 + Math.random() * 24 + "px"
      };
      tempEmojis.push({ emoji, style });
    }

    setEmojis(tempEmojis);
  }, []);

  return (
    <div className="body-container">

      {emojis.map((e, idx) => (
        <span key={idx} className="floating-emoji" style={e.style}>
          {e.emoji}
        </span>
      ))}

      <div className="container">
        <h1 style={{ color: "#fff" }}>Styleyoung Moo Kob</h1>

        <div className="tabs">
          <button
            className={activeTab === "login" ? "active" : ""}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={activeTab === "register" ? "active" : ""}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        <form className={`form ${activeTab === "login" ? "active" : ""}`}>
          <input type="username" placeholder="Username" />
          <input type="password" placeholder="Password" required />
          <button type="submit" className="btn">Login</button>
        </form>

        <form className={`form ${activeTab === "register" ? "active" : ""}`}>
          <input type="text" placeholder="Full Name" required />
          <input type="username" placeholder="Username" required />
          <input type="password" placeholder="Password" required />
          <input type="password" placeholder="Confirm Password" required />
          <button type="submit" className="btn">Register</button>
        </form>
      </div>
    </div>
  );
}

export default App;
