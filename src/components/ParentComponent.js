import React from 'react';
import { useParams } from 'react-router-dom';
import Editor from './Editor';

function ParentComponent() {
  const { documentId } = useParams(); // Get documentId from the URL params

  return <Editor documentId={documentId} />;
}

export default ParentComponent;
