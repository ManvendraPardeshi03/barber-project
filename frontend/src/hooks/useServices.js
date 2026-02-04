import { useEffect, useState } from "react";
import API from "../utils/api";

export default function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/services")
      .then(res => {
        setServices(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load services");
        setLoading(false);
      });
  }, []);

  return { services, loading, error };
}
