import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/login"
            element={
              <div className="min-h-screen flex items-center justify-center text-2xl">
                Login Page Coming Soon...
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
