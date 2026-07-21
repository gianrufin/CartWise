import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppNav } from "./components/AppNav";
import { Welcome } from "./screens/Welcome";
import { Home } from "./screens/Home";
import { Lists } from "./screens/Lists";
import { ListDetail } from "./screens/ListDetail";
import { AddItem } from "./screens/AddItem";
import { ShoppingMode } from "./screens/ShoppingMode";
import { TripSummary } from "./screens/TripSummary";
import { Reports } from "./screens/Reports";
import { Settings } from "./screens/Settings";

const NAV_ROUTES = ["/home", "/lists", "/reports", "/settings"];

export default function App() {
  const { pathname } = useLocation();
  const showNav = NAV_ROUTES.includes(pathname);

  return (
    <div className="app-shell">
      {showNav && <AppNav variant="sidebar" />}
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Home />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/list/:listId" element={<ListDetail />} />
          <Route path="/list/:listId/add-item" element={<AddItem />} />
          <Route path="/list/:listId/shopping" element={<ShoppingMode />} />
          <Route path="/trip/:tripId" element={<TripSummary />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showNav && <AppNav variant="bottom" />}
    </div>
  );
}
