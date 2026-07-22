import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Interview from "./pages/Interview";
import SessionSummary from "./pages/SessionSummary";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/interview" element={<Interview />} />
      <Route path="/summary/:sessionId" element={<SessionSummary />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
