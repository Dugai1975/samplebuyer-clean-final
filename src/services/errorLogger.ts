// Simple error logging service for debugging, analytics, and support escalation
export class ErrorLogger {
  log(context: string, error: any) {
    // Log to console for dev
    console.error(`[Error][${context}]`, error);
    // TODO: Send to remote logging/analytics endpoint if needed
  }
  reportUserError(context: string, error: string) {
    // For user-facing error feedback
    // TODO: Integrate with user feedback or support system
    console.warn(`[UserError][${context}]`, error);
  }
}

export const errorLogger = new ErrorLogger();
