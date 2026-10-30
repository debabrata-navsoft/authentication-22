import { RenderMode, ServerRoute } from '@angular/ssr';

// Auth state lives in localStorage, which only exists in the browser,
// so pages are rendered on the client instead of being prerendered.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
