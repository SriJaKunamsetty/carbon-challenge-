/**
 * @module firestore.types
 * @description Shared types, interfaces, and error class for the Firestore service layer.
 */
import type { WhereFilterOp, OrderByDirection, DocumentSnapshot } from "firebase/firestore";

/**
 * Typed error class for Firestore operations.
 * Wraps the original FirestoreError with additional context.
 */
export class FirestoreServiceError extends Error {
  /** The Firestore error code, if available */
  public readonly code: string;
  /** The collection path that was being accessed */
  public readonly collectionPath: string;

  constructor(message: string, code: string, collectionPath: string) {
    super(message);
    this.name = "FirestoreServiceError";
    this.code = code;
    this.collectionPath = collectionPath;
  }
}

/**
 * Represents a single `where` clause for building Firestore queries.
 */
export interface WhereClause {
  /** The field path to filter on */
  field: string;
  /** The comparison operator */
  operator: WhereFilterOp;
  /** The value to compare against */
  value: unknown;
}

/**
 * Represents an `orderBy` clause for building Firestore queries.
 */
export interface OrderByClause {
  /** The field path to order by */
  field: string;
  /** The sort direction (defaults to 'asc') */
  direction?: OrderByDirection;
}

/**
 * Configuration object for building Firestore queries.
 * Supports filtering, ordering, pagination, and limiting.
 */
export interface QueryConfig {
  /** Array of where filter clauses */
  whereClauses?: WhereClause[];
  /** Array of orderBy clauses */
  orderByClauses?: OrderByClause[];
  /** Maximum number of documents to return */
  limitCount?: number;
  /** Document snapshot to start after (for cursor-based pagination) */
  startAfterDoc?: DocumentSnapshot;
}
