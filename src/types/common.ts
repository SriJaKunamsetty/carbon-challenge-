/**
 * @module types/common
 * @description Shared type primitives used across the CarbonMind AI domain.
 */

/** Firestore Timestamp representation for client-side use */
export type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
};

/** Represents either a Firestore Timestamp or a JS Date */
export type TimestampLike = FirestoreTimestamp | Date | string;

/** Audit log entry for security tracking */
export interface AuditLogEntry {
  /** User who performed the action */
  userId: string;
  /** Action performed */
  action: string;
  /** Additional details */
  details?: Record<string, unknown>;
  /** Timestamp */
  timestamp: TimestampLike;
}
