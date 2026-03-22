import React, { useState } from "react";
import Navbar from "../components/navbar";
import News from "../components/news";
import Stocks from "../components/Stocks";

const HomePage = () => {
    const [activeSection, setActiveSection] = useState("news");

    return (
        <div>
            <Navbar activeSection={activeSection} onSectionChange={setActiveSection} />

            {activeSection === "news" && <News />}
            {activeSection === "stocks" && <Stocks />}
            {activeSection === "startups" && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center text-gray-500">
                    Startups section coming soon.
                </div>
            )}
        </div>
    );
}

export default HomePage;