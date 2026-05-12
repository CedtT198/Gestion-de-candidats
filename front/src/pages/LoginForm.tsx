import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { login } from "../api/candidates.api";

export default function LoginForm() {
    const { register, handleSubmit } = useForm({ defaultValues: { email: "", password: "" } });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        setError(null);
        setLoading(true);

        try {
            await login(data);
            navigate("/candidates");
        } catch (err: any) {
            const message = err.response?.data?.message || "Erreur de connexion";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" {...register("email")} required />
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" {...register("password")} required />
            
            {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
            
            <button type="submit" disabled={loading}>
                {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
        </form>
    );
}