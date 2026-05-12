import app from "./app";
import connectDB from "./config/db";

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});