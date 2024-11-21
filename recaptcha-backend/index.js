const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.post("/verify-recaptcha", async (req, res) => {
  const secretKey = "6LeJpIUqAAAAABjkN_bTtcWSdIJYEV9qV8jfUwsG";
  const token = req.body.token;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token no enviado" });
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
      }
    );

    const data = response.data;

    if (data.success) {
      return res
        .status(200)
        .json({ success: true, message: "Verificación exitosa" });
    } else {
      return res.status(400).json({
        success: false,
        message: "Verificación fallida",
        errorCodes: data["error-codes"],
      });
    }
  } catch (error) {
    console.error("Error al verificar el reCAPTCHA:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
