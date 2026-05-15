"use client";

import { useState, useEffect } from "react";
import Profile from "@/components/MapComponent";

export default function ProfilePage() {
  const [savedLocations, setSavedLocations] = useState([]);
  const [yelpLocations, setYelpLocations] = useState([]);

  // get local data
  useEffect(() => {
    fetch("/api/locations?source=local")
      .then((res) => res.json())
      .then((data) => setSavedLocations(data.data));
  }, []);

  // search yelp shop or cafe,etc
  const searchYelp = async (location: string, term: string) => {
    const response = await fetch(
      `/api/locations?source=yelp&location=${location}&term=${term}`,
    );
    const data = await response.json();
    setYelpLocations(data.data);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <Profile
        name="Simon"
        email="abc@gmail.com"
        age={30}
        avatar="https://randomuser.me/api/portraits/men/1.jpg"
        savedLocations={savedLocations}
        yelpLocations={yelpLocations}
        onSearchYelp={searchYelp}
        // ... other props
      />
    </div>
  );
}
