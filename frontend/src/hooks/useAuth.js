import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Adjust path if needed

export const useAuth = () => useContext(AuthContext);
