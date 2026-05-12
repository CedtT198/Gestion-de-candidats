import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createCandidate, updateCandidate } from "../api/candidates.api";

export default function CandidateForm({ defaultValues, id }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm({ 
    defaultValues: defaultValues || { firstName: "", lastName: "", email: "", phone: "" }
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setError(null);
    setLoading(true);

    try {
      if (id) {
        await updateCandidate(id, data);
        navigate(`/candidate/${id}`);
      } else {
        const newCandidate = await createCandidate(data);
        navigate(`/candidate/${newCandidate._id}`);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Erreur lors de la sauvegarde";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="firstName">Prénom</label>
        <input 
          id="firstName"
          placeholder="Prénom" 
          {...register("firstName", { required: "Le prénom est requis" })} 
        />
        {typeof errors.firstName?.message === "string" && (
          <p style={{ color: "red" }}>{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="lastName">Nom</label>
        <input 
          id="lastName"
          placeholder="Nom" 
          {...register("lastName", { required: "Le nom est requis" })} 
        />
        {typeof errors.lastName?.message === "string" && (
          <p style={{ color: "red" }}>{errors.lastName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input 
          id="email"
          type="email"
          placeholder="Email" 
          {...register("email", { required: "L'email est requis", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email invalide" } })} 
        />
        {typeof errors.email?.message === "string" && (
          <p style={{ color: "red" }}>{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone">Téléphone</label>
        <input 
          id="phone"
          placeholder="Téléphone" 
          {...register("phone", { required: "Le téléphone est requis", minLength: { value: 10, message: "Minimum 10 caractères" } })} 
        />
        {typeof errors.phone?.message === "string" && (
          <p style={{ color: "red" }}>{errors.phone.message}</p>
        )}
      </div>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Sauvegarde..." : id ? "Modifier" : "Créer"}
      </button>
    </form>
  );
}