'use client';

import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { useZenClient } from '@filezen/react';

export const BlockNoteEditor = () => {
  const zenClient = useZenClient();

  // Custom upload function for BlockNote
  const uploadFile = async (file: File): Promise<string> => {
    const result = await zenClient.upload(file);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.file!.url!;
  };

  // Creates a new editor instance with FileZen upload integration
  const editor = useCreateBlockNote({
    uploadFile,
  });

  // Renders the editor instance using a React component
  return <BlockNoteView editor={editor} content={''} />;
};
