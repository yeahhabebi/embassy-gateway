/**
 * Maps database/API errors to safe, user-friendly messages.
 * Prevents leaking internal implementation details.
 */
export const getSafeErrorMessage = (error: any, fallback = "An error occurred. Please try again."): string => {
  if (!error) return fallback;

  // Handle specific PostgreSQL error codes
  if (error?.code) {
    switch (error.code) {
      case '42501':
        return 'Access denied. Please check your permissions.';
      case '23505':
        return 'This entry already exists.';
      case '23503':
        return 'Invalid reference. Please check your input.';
      case '22001':
        return 'Input is too long. Please shorten your text.';
      case '22P02':
        return 'Invalid input format. Please check your data.';
      case '23514':
        return 'Input does not meet requirements. Please check your data.';
      case 'PGRST301':
        return 'Session expired. Please log in again.';
      default:
        break;
    }
  }

  // Handle common error message patterns without exposing details
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('rls') || message.includes('row-level security')) {
    return 'Access denied. Please check your permissions.';
  }
  
  if (message.includes('foreign key')) {
    return 'Invalid reference. Please check your input.';
  }
  
  if (message.includes('unique') || message.includes('duplicate')) {
    return 'This entry already exists.';
  }
  
  if (message.includes('not found')) {
    return 'The requested item was not found.';
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Connection error. Please check your internet and try again.';
  }
  
  if (message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  if (message.includes('rate limit')) {
    return 'Too many requests. Please wait and try again.';
  }

  // Return the fallback for any other errors
  return fallback;
};

/**
 * Logs error details securely (for development/debugging).
 * In production, this would send to a logging service instead of console.
 */
export const logError = (context: string, error: any): void => {
  // In development, log to console
  // In production, this should send to a secure logging service
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
  // Production: would send to logging service here
};
