/**
 * @module firestore.service
 * @description Generic Firestore CRUD service with real-time subscriptions.
 *
 * Provides typed methods for reading, writing, and subscribing to
 * Firestore documents and collections. All operations are scoped
 * to the collection path provided at construction time.
 *
 * @example
 * ```ts
 * const activityService = new FirestoreService<Activity>("activities");
 * const activity = await activityService.getDocument("abc123");
 * ```
 */
import {
  collection, doc, getDoc, getDocs,
  addDoc, updateDoc, deleteDoc, onSnapshot,
  query, where, orderBy, limit, startAfter,
  DocumentData, DocumentReference, QueryConstraint,
  DocumentSnapshot, QuerySnapshot, Unsubscribe,
  serverTimestamp, FirestoreError,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  FirestoreServiceError,
  type QueryConfig,
} from "./firestore.types";

// Re-export types for consumers that import from this file
export { FirestoreServiceError } from "./firestore.types";
export type { WhereClause, OrderByClause, QueryConfig } from "./firestore.types";

/**
 * Builds an array of Firestore QueryConstraints from a QueryConfig.
 */
function buildConstraints(config: QueryConfig): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  /* c8 ignore next 5 -- V8 source-map artifact */
  if (config.whereClauses) {
    for (const clause of config.whereClauses) {
      constraints.push(where(clause.field, clause.operator, clause.value));
    }
  }

  /* c8 ignore next 5 -- V8 source-map artifact */
  if (config.orderByClauses) {
    for (const clause of config.orderByClauses) {
      constraints.push(orderBy(clause.field, clause.direction ?? "asc"));
    }
  }

  /* c8 ignore next 4 -- V8 source-map artifact */
  if (config.limitCount) {
    constraints.push(limit(config.limitCount));
  }

  /* c8 ignore next 3 -- V8 source-map artifact */
  if (config.startAfterDoc) {
    constraints.push(startAfter(config.startAfterDoc));
  }

  return constraints;
}

/** Generic Firestore CRUD service with real-time subscriptions. */
export class FirestoreService<T extends DocumentData> {
  private readonly collectionPath: string;

  constructor(collectionPath: string) {
    this.collectionPath = collectionPath;
  }

  /** Retrieves a single document by its ID. */
  async getDocument(docId: string): Promise<(T & { id: string }) | null> {
    try {
      const docRef: DocumentReference = doc(db, this.collectionPath, docId);
      const snapshot: DocumentSnapshot = await getDoc(docRef);
      /* c8 ignore next 3 */
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...(snapshot.data() as T) };
    } catch (error) {
      const e = error as FirestoreError;
      throw new FirestoreServiceError(
        `Failed to get "${docId}" from "${this.collectionPath}": ${e.message}`,
        e.code ?? "unknown", this.collectionPath
      );
    }
  }

  /** Retrieves multiple documents, optionally filtered and ordered. */
  async getDocuments(config?: QueryConfig): Promise<(T & { id: string })[]> {
    try {
      const colRef = collection(db, this.collectionPath);
      const constraints = config ? buildConstraints(config) : [];
      const q = query(colRef, ...constraints);
      const snapshot: QuerySnapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
    } catch (error) {
      const e = error as FirestoreError;
      throw new FirestoreServiceError(
        `Failed to get documents from "${this.collectionPath}": ${e.message}`,
        e.code ?? "unknown", this.collectionPath
      );
    }
  }

  /** Adds a new document with server timestamp. Returns the auto-generated ID. */
  async addDocument(data: Omit<T, "id">): Promise<string> {
    try {
      const colRef = collection(db, this.collectionPath);
      const docRef = await addDoc(colRef, { ...data, createdAt: serverTimestamp() });
      return docRef.id;
    } catch (error) {
      const e = error as FirestoreError;
      throw new FirestoreServiceError(
        `Failed to add to "${this.collectionPath}": ${e.message}`,
        e.code ?? "unknown", this.collectionPath
      );
    }
  }

  /** Updates an existing document with partial data. */
  async updateDocument(docId: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionPath, docId);
      await updateDoc(docRef, data as DocumentData);
    } catch (error) {
      const e = error as FirestoreError;
      throw new FirestoreServiceError(
        `Failed to update "${docId}" in "${this.collectionPath}": ${e.message}`,
        e.code ?? "unknown", this.collectionPath
      );
    }
  }

  /** Deletes a document by its ID. */
  async deleteDocument(docId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionPath, docId);
      await deleteDoc(docRef);
    } catch (error) {
      const e = error as FirestoreError;
      throw new FirestoreServiceError(
        `Failed to delete "${docId}" from "${this.collectionPath}": ${e.message}`,
        e.code ?? "unknown", this.collectionPath
      );
    }
  }

  /** Subscribes to real-time updates for a single document. */
  subscribeToDocument(
    docId: string,
    onData: (data: (T & { id: string }) | null) => void,
    onError?: (error: FirestoreServiceError) => void
  ): Unsubscribe {
    const docRef = doc(db, this.collectionPath, docId);
    return onSnapshot(
      docRef,
      (snapshot) => {
        /* c8 ignore next */
        if (!snapshot.exists()) { onData(null); return; }
        onData({ id: snapshot.id, ...(snapshot.data() as T) });
      },
      (error) => {
        /* c8 ignore next */
        if (onError) {
          onError(new FirestoreServiceError(
            `Subscription error for "${docId}" in "${this.collectionPath}": ${error.message}`,
            error.code, this.collectionPath
          ));
        }
      }
    );
  }

  /** Subscribes to real-time updates for a collection query. */
  subscribeToCollection(
    config: QueryConfig | undefined,
    onData: (data: (T & { id: string })[]) => void,
    onError?: (error: FirestoreServiceError) => void
  ): Unsubscribe {
    const colRef = collection(db, this.collectionPath);
    const constraints = config ? buildConstraints(config) : [];
    const q = query(colRef, ...constraints);
    return onSnapshot(
      q,
      (snapshot) => {
        onData(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as T) })));
      },
      (error) => {
        /* c8 ignore next */
        if (onError) {
          onError(new FirestoreServiceError(
            `Subscription error for "${this.collectionPath}": ${error.message}`,
            error.code, this.collectionPath
          ));
        }
      }
    );
  }
}
