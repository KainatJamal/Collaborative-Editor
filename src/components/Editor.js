import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import mammoth from 'mammoth';
import { saveAs } from 'file-saver';
import '../styles/styles.css';
const socket = io('http://localhost:5000');
function Editor({ documentId }) {
  const [content, setContent] = useState('');
  const [version, setVersion] = useState(0);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('document');
  const [selectedFont, setSelectedFont] = useState('');
  const [selectedFontSize, setSelectedFontSize] = useState('Font Size');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isLocked, setIsLocked] = useState(false);
  const editorRef = useRef(null);
  useEffect(() => {
    if (documentId) {
      axios
        .get(`http://localhost:5000/documents/${documentId}`)
        .then((response) => {
          setContent(response.data.content);
          setVersion(response.data.version);
          setIsEditorVisible(true);
        })
        .catch((error) => {
          console.error('Network request failed:', error.response || error);
        });
      socket.on('updateDocument', (data) => {
        if (data.version > version) {
          setContent(data.content);
          setVersion(data.version);
        }
      });
      return () => socket.off('updateDocument');
    } else {
      console.error('Document ID is undefined');
    }
  }, [documentId, version]);
  const handleChange = (e) => {
    if (!isLocked) {
      const newContent = e.target.innerHTML;
      setContent(newContent);
      socket.emit('editDocument', { content: newContent, version });
    }
  };
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsImporting(true);
      setProgress(0);
      setFileName(file.name);

      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.loaded && event.total) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setProgress(percentage);
        }
      };

      reader.onload = (event) => {
        const arrayBuffer = event.target.result;
        mammoth
          .convertToHtml({ arrayBuffer: arrayBuffer })
          .then((result) => {
            setContent(result.value);
            setVersion(0);
            setIsImporting(false);
            setImportSuccess(true);
            setIsEditorVisible(true);
          })
          .catch((err) => {
            console.error('Error extracting content from docx:', err);
            setIsImporting(false);
          });
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const applyStyle = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const handleFontChange = (e) => {
    const font = e.target.value;
    setSelectedFont(font);
    if (editorRef.current) {
      applyStyle('fontName', font);
    }
  };

  const handleFontSizeChange = (e) => {
    const fontSize = e.target.value;
    if (fontSize !== 'Font Size') {
      setSelectedFontSize(fontSize);
      if (editorRef.current) {
        applyStyle('fontSize', fontSize);
      }
    }
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    setSelectedColor(color);
    if (editorRef.current) {
      applyStyle('foreColor', color);
    }
  };

  const saveDocument = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/documents/${documentId}`, {
        content: content,
        version: version
      });

      if (response.data) {
        setVersion(response.data.version);
        alert('Document saved successfully!');
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        const latestDocument = error.response.data;
        setContent(latestDocument.content);
        setVersion(latestDocument.version);
        alert('Version conflict detected. Latest content has been loaded.');
      } else {
        console.error('Error saving document:', error);
        alert('Failed to save document.');
      }
    }
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  const downloadDocument = () => {
    const blob = new Blob([content], { type: 'text/html' });
    saveAs(blob, `${fileName}.html`);
  };

  return (
    <div className="editor-container">
      <header>
        <h1>Collaborative Document Editor</h1>
        {!isEditorVisible && (
          <div className="file-import-container">
            <input
              type="file"
              id="file-import"
              className="file-import-input"
              onChange={handleFileImport}
              hidden
            />
            <label htmlFor="file-import" className="file-import-button">
              Import File
            </label>
          </div>
        )}
        {isImporting && (
          <div className="import-progress-container">
            <div
              className="import-progress-bar"
              style={{ width: `${progress}%` }}
            />
            <div className="import-progress-text">{`Importing... ${progress}%`}</div>
          </div>
        )}
        {importSuccess && !isImporting && (
          <div className="import-success-bar">
            File imported successfully! ({fileName})
          </div>
        )}
      </header>

      {isEditorVisible && (
        <>
          <div className="toolbar">
            <button onClick={() => applyStyle('bold')}>Bold</button>
            <button onClick={() => applyStyle('italic')}>Italic</button>
            <button onClick={() => applyStyle('underline')}>Underline</button>
            <button onClick={() => applyStyle('justifyLeft')}>Left</button>
            <button onClick={() => applyStyle('justifyCenter')}>Center</button>
            <button onClick={() => applyStyle('justifyRight')}>Right</button>
            <button onClick={() => applyStyle('justifyFull')}>Justify</button>
          </div>

          <div className="font-dropdown-container">
            <select
              value={selectedFont || 'Fonts'}
              onChange={handleFontChange}
              className="font-dropdown"
            >
              <option value="Fonts" disabled>Fonts</option>
              <option value="Segoe UI">Segoe UI</option>
              <option value="Arial">Arial</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>

          <div className="font-size-dropdown-container">
            <select
              value={selectedFontSize || 'Font Size'}
              onChange={handleFontSizeChange}
              className="font-size-dropdown"
            >
              <option value="Font Size" disabled>Font Size</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="28px">28px</option>
              <option value="32px">32px</option>
            </select>
          </div>

          <div className="color-picker-container">
            <label htmlFor="color-picker">Font Color:</label>
            <input
              id="color-picker"
              type="color"
              value={selectedColor}
              onChange={handleColorChange}
              className="color-picker"
            />
          </div>
        </>
      )}

      {isEditorVisible && (
        <section className="editor-body">
          <div
            className="editor-content"
            contentEditable
            ref={editorRef}
            onInput={handleChange}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </section>
      )}

      {isEditorVisible && (
        <footer className="editor-footer">
          <button onClick={downloadDocument}>Download Document</button>
        </footer>
      )}
    </div>
  );
}

export default Editor;
