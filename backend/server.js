const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Document = require('./models/documentModel');  // Assume Document is a Mongoose model

const app = express();
const port = 5000;
const cors = require('cors');

// Enable CORS for all origins
app.use(cors());

// Or configure it for specific origins
app.use(cors({
  origin: 'http://localhost:3000', // allow requests from frontend
}));

mongoose.connect('mongodb+srv://kainatjamal2:5AVrHsvldRheW5Rt@cluster0.hule4.mongodb.net/collabeditor?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((error) => {
  console.error('Error connecting to MongoDB Atlas:', error);
});


app.use(bodyParser.json());

app.get('/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ error: 'Invalid documentId' });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Error fetching document' });
  }
});

app.post('/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { content, version } = req.body;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ error: 'Invalid documentId' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const existingDocument = await Document.findById(documentId);
    if (existingDocument && existingDocument.version > version) {
      return res.status(409).json(existingDocument); // Conflict due to version mismatch
    }

    const document = await Document.findByIdAndUpdate(
      documentId,
      { content, version: version + 1 },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error saving document:', error);
    res.status(500).json({ error: 'Error saving document' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
