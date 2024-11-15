# Real-Time Collaborative Editing Tool

A simple and intuitive real-time collaborative document editor built using React, Socket.io, and MongoDB. It allows multiple users to edit a document simultaneously and see real-time changes.

## Features

- **Real-Time Collaboration**: Edit documents together in real-time with other users.
- **Import Documents**: Import `.docx` files and start editing.
- **Text Styling**: Apply basic text styles like bold, italic, underline, and font customization.
- **Version Control**: Automatic versioning to avoid conflicts.
- **Document Download**: Download the document as an HTML file.
- **User Lock**: Lock the document to prevent accidental edits.

## Technologies Used

- **Frontend**: React, Axios
- **Backend**: Express.js, Socket.io
- **Database**: MongoDB
- **Document Conversion**: Mammoth.js for converting `.docx` files to HTML
- **File Handling**: FileSaver.js to download documents

## Usage
- **Create/Edit a Document**: Start by editing a new document or load an existing one using the document ID.
- **Collaborate in Real-Time**: Other users can join and edit the document at the same time.
- **Apply Styles**: Use the toolbar to change text styles like bold, italic, font, size, and color.
- **Download Document**: After editing, download the document as an HTML file by clicking the "Download" button.
