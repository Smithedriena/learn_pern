import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { GameProvider, useGame } from "@/context/GameContext";
import Layout from "@/components/Layout";
import NicknameModal from "@/components/NicknameModal";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import TrackDetail from "@/pages/TrackDetail";
import Challenge from "@/pages/Challenge";
import Sandbox from "@/pages/Sandbox";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";

function StreakTouch() {
  const { touchStreak, nickname } = useGame();
  useEffect(() => { if (nickname) touchStreak(); }, [nickname, touchStreak]);
  return null;
}

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Layout>
          <StreakTouch />
          <NicknameModal />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/learn" element={<Dashboard />} />
            <Route path="/learn/:trackId" element={<TrackDetail />} />
            <Route path="/challenge/:id" element={<Challenge />} />
            <Route path="/sandbox" element={<Sandbox />} />
            <Route path="/sandbox/:trackId" element={<Sandbox />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#0d0d13",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "13px",
            },
          }}
        />
      </BrowserRouter>
    </GameProvider>
  );
}
