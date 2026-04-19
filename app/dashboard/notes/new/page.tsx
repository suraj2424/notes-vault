import { Suspense } from 'react';
import { NewNoteForm } from './NewNoteForm';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewNoteForm />
    </Suspense>
  );
}
