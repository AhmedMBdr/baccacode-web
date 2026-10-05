import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorBody } from '../models';

/** The one error shape the UI deals with (spec 24.2). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly traceId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static from(err: unknown): ApiError {
    if (err instanceof ApiError) return err;
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return new ApiError(0, 'NETWORK', 'Network error');
      const body = err.error as Partial<ApiErrorBody> | null;
      return new ApiError(
        err.status,
        body?.code ?? `HTTP_${err.status}`,
        body?.message ?? err.message,
        body?.traceId,
      );
    }
    return new ApiError(500, 'UNKNOWN', err instanceof Error ? err.message : 'Unknown error');
  }
}
