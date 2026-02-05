import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../utils/api";


function LoginForm({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE", res.data);

      // Use the top-level object as user
      const user = res.data;

      if (!user || !user.role) {
        setError("Login failed: Invalid response from server");
        return;
      }

      // Only allow barber role
      if (user.role !== "barber") {
        setError("You are not authorized as a barber.");
        return;
      }

      setSuccess("Login successful!");
      localStorage.setItem("token", user.token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      navigate("/barber/dashboard");
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError("Login failed: Unknown error");
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Barber Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <button type="submit" style={{ width: "100%", padding: "10px" }}>
        Login
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      {success && <p style={{ color: "green", marginTop: "10px" }}>{success}</p>}
    </form>
  );
}

export default LoginForm;
