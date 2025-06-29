'use client';

import { BlockNoteEditor } from '@/components/BlockNoteEditor';

export default function Home() {
  return (
    <main className="container">
      <div className="header">
        <h1>FileZen BlockNote Editor</h1>
        <p>
          Rich text editor with drag-and-drop image uploads powered by{' '}
          <a
            href="https://www.blocknotejs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            BlockNote
          </a>{' '}
          and FileZen.
        </p>
      </div>

      <div className="editor-container">
        <BlockNoteEditor />
      </div>
    </main>
  );
}
