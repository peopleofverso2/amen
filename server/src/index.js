const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Configuration de CORS
app.use(cors());
app.use(express.json());

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Base de données en mémoire pour les métadonnées
let mediaFiles = [];

// Routes
app.post('/api/media/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      throw new Error('Aucun fichier uploadé');
    }

    const file = req.file;
    let tags = [];
    
    // Récupérer les tags s'ils sont présents
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        console.warn('Impossible de parser les tags:', e);
      }
    }

    const metadata = {
      id: Date.now().toString(),
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      tags: tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mediaFiles.push(metadata);
    res.json(metadata);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/media', (req, res) => {
  const { search, tags } = req.query;
  let filteredFiles = [...mediaFiles];

  if (search) {
    const searchLower = search.toLowerCase();
    filteredFiles = filteredFiles.filter(file => 
      file.originalName.toLowerCase().includes(searchLower) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  if (tags) {
    const tagList = tags.split(',');
    filteredFiles = filteredFiles.filter(file =>
      tagList.some(tag => file.tags.includes(tag))
    );
  }

  res.json(filteredFiles);
});

app.get('/api/media/:id', (req, res) => {
  const { id } = req.params;
  const file = mediaFiles.find(f => f.id === id);
  
  if (!file) {
    return res.status(404).json({ error: 'Fichier non trouvé' });
  }

  res.json(file);
});

app.delete('/api/media/:id', (req, res) => {
  const { id } = req.params;
  const fileIndex = mediaFiles.findIndex(f => f.id === id);
  
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'Fichier non trouvé' });
  }

  const file = mediaFiles[fileIndex];
  const filePath = path.join(__dirname, '../uploads', file.filename);

  try {
    fs.unlinkSync(filePath);
    mediaFiles = mediaFiles.filter(f => f.id !== id);
    res.json({ message: 'Fichier supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
  }
});

app.patch('/api/media/:id', (req, res) => {
  const { id } = req.params;
  const fileIndex = mediaFiles.findIndex(f => f.id === id);
  
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'Fichier non trouvé' });
  }

  const updates = req.body;
  const file = mediaFiles[fileIndex];

  // Mise à jour des métadonnées autorisées
  if (updates.tags) {
    file.tags = updates.tags;
  }

  file.updatedAt = new Date();
  mediaFiles[fileIndex] = file;

  res.json(file);
});

// Middleware de gestion d'erreurs
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
