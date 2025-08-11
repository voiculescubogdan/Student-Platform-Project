import express from "express";
import routes from "./routes/index.mjs";
import middleware from "./middleware/index.mjs";
import path from "path";
import { fileURLToPath } from 'url';
import cors from 'cors'
import compression from "compression";
import morgan from "morgan";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ['http://localhost:4000'] }))
app.use(express.json());

app.use(compression({
  filter: (req, res) => {
    if (req.url.match(/\.(jpg|jpeg|png|gif|webp|ico|svg)$/i)) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024,
  level: 6,
  chunkSize: 1024
}));

app.use(morgan(':method :url → :status in :response-time ms'));

app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Express');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  if (req.url.startsWith('/uploads/')) {
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('X-Static-File', 'true');
    
    if (req.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.setHeader('Link', '</uploads/' + path.basename(req.url) + '>; rel=preload; as=image');
    }
  }
  
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  immutable: true,
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp|ico)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      res.setHeader('Vary', 'Accept-Encoding');
    }
    if (filePath.match(/\.(html|htm)$/i)) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.use(middleware.passport.initialize());

app.use("/api", routes.api);
app.use("/auth", routes.auth);

app.use(express.static(path.resolve(__dirname, '../client')))
app.get('*', (_, res) => {
  res.sendFile(path.resolve(__dirname, '../client/index.html'))
})

export default app;