import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Something went wrong, please try again';
  if (error.status === 0) return 'Cannot reach the server. Is the backend running?';
  return error.error?.message ?? 'Something went wrong, please try again';
}
