import { toast } from 'sonner'

/**
 * Centralized toast notification service for the application.
 * Provides consistent, accessible notifications for all user feedback scenarios.
 */

// Duration constants (in milliseconds)
const DURATIONS = {
  SUCCESS: 4000,      // 4 seconds for success messages
  ERROR: 4000,       // 4 seconds for error messages
  WARNING: 4000,      // 4 seconds for warnings
  INFO: 4000,         // 4 seconds for info messages
} as const

// Standard message templates
const MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Welcome back! You have successfully signed in.',
  LOGIN_FAILURE: 'Unable to sign in. Please check your credentials and try again.',
  REGISTER_SUCCESS: 'Account created successfully! Welcome to Resume Fix.',
  REGISTER_FAILURE: 'Unable to create account. Please try again.',
  LOGOUT_SUCCESS: 'You have been signed out successfully.',
  
  // Resume/CV operations
  RESUME_UPLOAD_SUCCESS: 'Resume uploaded successfully!',
  RESUME_UPLOAD_FAILURE: 'Failed to upload resume. Please try again.',
  RESUME_DELETE_SUCCESS: 'Resume deleted successfully.',
  RESUME_DELETE_FAILURE: 'Failed to delete resume. Please try again.',
  
  // Analysis operations
  ANALYSIS_SUCCESS: 'Analysis completed successfully!',
  ANALYSIS_FAILURE: 'Failed to run analysis. Please try again.',
  
  // Job description operations
  JOB_DESCRIPTION_CREATED: 'Job description created successfully.',
  JOB_DESCRIPTION_SAVED: 'Job description saved.',
  JOB_DESCRIPTION_DELETED: 'Job description deleted successfully.',
  JOB_DESCRIPTION_FAILURE: 'Failed to save job description. Please try again.',
} as const

/**
 * Toast notification service with standardized methods for each event type.
 */
export const toastService = {
  // ─────────────────────────────────────────────────────────────────────────
  // Authentication Notifications
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Display success toast for successful login
   */
  loginSuccess: (email?: string) => {
    toast.success(email ? `Welcome back, ${email}!` : MESSAGES.LOGIN_SUCCESS, {
      duration: DURATIONS.SUCCESS,
      id: 'login-success',
    })
  },
  
  /**
   * Display error toast for login failure
   */
  loginFailure: (errorMessage?: string) => {
    toast.error(errorMessage || MESSAGES.LOGIN_FAILURE, {
      duration: DURATIONS.ERROR,
      id: 'login-error',
    })
  },
  
  /**
   * Display success toast for successful registration
   */
  registerSuccess: (email?: string) => {
    toast.success(
      email ? `Welcome to Resume Fix, ${email}!` : MESSAGES.REGISTER_SUCCESS,
      {
        duration: DURATIONS.SUCCESS,
        id: 'register-success',
      }
    )
  },
  
  /**
   * Display error toast for registration failure
   */
  registerFailure: (errorMessage?: string) => {
    toast.error(errorMessage || MESSAGES.REGISTER_FAILURE, {
      duration: DURATIONS.ERROR,
      id: 'register-error',
    })
  },
  
  /**
   * Display success toast for logout
   */
  logoutSuccess: () => {
    toast.success(MESSAGES.LOGOUT_SUCCESS, {
      duration: DURATIONS.SUCCESS,
      id: 'logout-success',
    })
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Resume/CV Notifications
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Display success toast for successful resume upload
   */
  resumeUploadSuccess: (fileName?: string) => {
    toast.success(
      fileName ? `"${fileName}" uploaded successfully!` : MESSAGES.RESUME_UPLOAD_SUCCESS,
      {
        duration: DURATIONS.SUCCESS,
        id: 'resume-upload-success',
      }
    )
  },
  
  /**
   * Display error toast for resume upload failure
   */
  resumeUploadFailure: (errorMessage?: string) => {
    toast.error(errorMessage || MESSAGES.RESUME_UPLOAD_FAILURE, {
      duration: DURATIONS.ERROR,
      id: 'resume-upload-error',
    })
  },
  
  /**
   * Display success toast for resume deletion
   */
  resumeDeleteSuccess: () => {
    toast.success(MESSAGES.RESUME_DELETE_SUCCESS, {
      duration: DURATIONS.SUCCESS,
      id: 'resume-delete-success',
    })
  },
  
  /**
   * Display error toast for resume deletion failure
   */
  resumeDeleteFailure: (errorMessage?: string) => {
    toast.error(errorMessage || MESSAGES.RESUME_DELETE_FAILURE, {
      duration: DURATIONS.ERROR,
      id: 'resume-delete-error',
    })
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Analysis Notifications
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Display success toast for analysis completion
   */
  analysisSuccess: () => {
    toast.success(MESSAGES.ANALYSIS_SUCCESS, {
      duration: DURATIONS.SUCCESS,
      id: 'analysis-success',
    })
  },
  
  /**
   * Display error toast for analysis failure
   */
  analysisFailure: (errorMessage?: string) => {
    toast.error(errorMessage || MESSAGES.ANALYSIS_FAILURE, {
      duration: DURATIONS.ERROR,
      id: 'analysis-error',
    })
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Job Description Notifications
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Display success toast for job description creation
   */
  jobDescriptionCreated: () => {
    toast.success(MESSAGES.JOB_DESCRIPTION_CREATED, {
      duration: DURATIONS.SUCCESS,
      id: 'jd-created',
    })
  },
  
  /**
   * Display success toast for job description save
   */
  jobDescriptionSaved: () => {
    toast.success(MESSAGES.JOB_DESCRIPTION_SAVED, {
      duration: DURATIONS.SUCCESS,
      id: 'jd-saved',
    })
  },
  
  /**
   * Display error toast for job description save failure
   */
  jobDescriptionFailure: (errorMessage?: string) => {
    toast.error(errorMessage || MESSAGES.JOB_DESCRIPTION_FAILURE, {
      duration: DURATIONS.ERROR,
      id: 'jd-error',
    })
  },
  
  /**
   * Display success toast for job description deletion
   */
  jobDescriptionDeleted: () => {
    toast.success(MESSAGES.JOB_DESCRIPTION_DELETED, {
      duration: DURATIONS.SUCCESS,
      id: 'jd-deleted',
    })
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Generic Notifications
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Display a generic success toast
   */
  success: (message: string, options?: { duration?: number; id?: string }) => {
    toast.success(message, {
      duration: options?.duration ?? DURATIONS.SUCCESS,
      id: options?.id,
    })
  },
  
  /**
   * Display a generic error toast
   */
  error: (message: string, options?: { duration?: number; id?: string }) => {
    toast.error(message, {
      duration: options?.duration ?? DURATIONS.ERROR,
      id: options?.id,
    })
  },
  
  /**
   * Display a generic warning toast
   */
  warning: (message: string, options?: { duration?: number; id?: string }) => {
    toast.warning(message, {
      duration: options?.duration ?? DURATIONS.WARNING,
      id: options?.id,
    })
  },
  
  /**
   * Display a generic info toast
   */
  info: (message: string, options?: { duration?: number; id?: string }) => {
    toast.info(message, {
      duration: options?.duration ?? DURATIONS.INFO,
      id: options?.id,
    })
  },
  
  /**
   * Display a loading toast that can be updated
   */
  loading: (message: string, options?: { id?: string }) => {
    return toast.loading(message, {
      id: options?.id,
    })
  },
  
  /**
   * Dismiss a specific toast by ID or all toasts
   */
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },
  
  /**
   * Display a promise-based toast with loading, success, and error states
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    }
  ) => {
    return toast.promise(promise, messages)
  },
}

// Export individual toast functions for convenience
export const {
  loginSuccess,
  loginFailure,
  registerSuccess,
  registerFailure,
  logoutSuccess,
  resumeUploadSuccess,
  resumeUploadFailure,
  resumeDeleteSuccess,
  resumeDeleteFailure,
  analysisSuccess,
  analysisFailure,
  jobDescriptionCreated,
  jobDescriptionSaved,
  jobDescriptionDeleted,
  jobDescriptionFailure,
} = toastService
