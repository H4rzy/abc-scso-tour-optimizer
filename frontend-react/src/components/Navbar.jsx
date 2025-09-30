import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <h1 className="font-bold">Tour Optimizer</h1>
      <div className="space-x-4">
        <Link to="/">Login</Link>
        <Link to="/demo">Demo</Link>
      </div>
    </nav>
  );
}
