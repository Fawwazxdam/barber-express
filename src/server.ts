import "dotenv/config";
import app from "./app";
import cors from "cors";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use(cors({
  origin: [
    'https://memangkas.magentaa.space',
    'http://localhost:3000'
  ],
  credentials: true
}));