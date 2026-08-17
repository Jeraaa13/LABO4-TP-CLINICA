require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.post("/verify-recaptcha", async (req, res) => {
  const token = req.body.token; // Obtener el token de la solicitud

  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  try {
    // Verificar el token con la API de reCAPTCHA de Google
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      {
        method: "POST",
      }
    );

    const verificationResult = await response.json();
    if (verificationResult.success) {
      // El token es válido
      return res.status(200).json({ success: true });
    } else {
      // El token no es válido
      return res.status(400).json({ error: "Invalid captcha token" });
    }
  } catch (error) {
    console.error("Error verificando el captcha:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
