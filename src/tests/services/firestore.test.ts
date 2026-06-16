/**
 * @module FirestoreService Tests
 * Tests for the FirestoreService class that provides typed CRUD operations
 * on Firestore documents and collections.
 */
import { vi } from 'vitest';
import { FirestoreService, FirestoreServiceError } from '@/services/firestore.service';

// ─── Hoisted Mock Functions ───────────────────────────────────────────────────
// Use vi.hoisted() to ensure these are available when vi.mock factories run

const mocks = vi.hoisted(() => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  serverTimestamp: vi.fn(() => 'mockTimestamp'),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  getDocs: mocks.getDocs,
  addDoc: mocks.addDoc,
  updateDoc: mocks.updateDoc,
  deleteDoc: mocks.deleteDoc,
  onSnapshot: mocks.onSnapshot,
  collection: mocks.collection,
  query: mocks.query,
  where: mocks.where,
  orderBy: mocks.orderBy,
  limit: mocks.limit,
  startAfter: mocks.startAfter,
  serverTimestamp: mocks.serverTimestamp,
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FirestoreService', () => {
  let service: FirestoreService<Record<string, unknown>>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FirestoreService('testCollection');
  });

  describe('getDocument', () => {
    it('returns null if document does not exist', async () => {
      mocks.doc.mockReturnValue('docRef');
      mocks.getDoc.mockResolvedValue({ exists: () => false });

      const docData = await service.getDocument('doc123');
      expect(docData).toBeNull();
    });

    it('returns doc data if it exists', async () => {
      const mockData = { name: 'John Doe', email: 'john@example.com' };
      mocks.doc.mockReturnValue('docRef');
      mocks.getDoc.mockResolvedValue({
        exists: () => true,
        id: 'doc123',
        data: () => mockData,
      });

      const docData = await service.getDocument('doc123');
      expect(docData).toEqual({ id: 'doc123', ...mockData });
    });

    it('throws FirestoreServiceError on operation failure', async () => {
      mocks.doc.mockReturnValue('docRef');
      mocks.getDoc.mockRejectedValue({ code: 'permission-denied', message: 'Denied' });

      await expect(service.getDocument('doc123')).rejects.toThrow(FirestoreServiceError);
    });

    it('returns null when document does not exist', async () => {
      mocks.doc.mockReturnValue('docRef');
      mocks.getDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await service.getDocument('doc123');
      expect(result).toBeNull();
    });

    it('throws with unknown code when error has no code field', async () => {
      mocks.doc.mockReturnValue('docRef');
      // Mock error without .code field → triggers ?? 'unknown' fallback
      mocks.getDoc.mockRejectedValue({ message: 'Raw network error' });

      await expect(service.getDocument('doc123')).rejects.toThrow(FirestoreServiceError);
    });
  });

  describe('getDocuments', () => {
    it('returns list of documents', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ name: 'Doc 1' }) },
        { id: '2', data: () => ({ name: 'Doc 2' }) },
      ];
      mocks.collection.mockReturnValue('colRef');
      mocks.query.mockReturnValue('queryRef');
      mocks.getDocs.mockResolvedValue({ docs: mockDocs });

      const results = await service.getDocuments({
        whereClauses: [{ field: 'userId', operator: '==', value: '123' }],
        orderByClauses: [{ field: 'date', direction: 'desc' }],
        limitCount: 5,
        startAfterDoc: {} as never,
      });

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ id: '1', name: 'Doc 1' });
    });

    it('returns documents with only whereClauses (covers false branches for orderBy/limit/startAfter)', async () => {
      mocks.collection.mockReturnValue('colRef');
      mocks.query.mockReturnValue('queryRef');
      mocks.getDocs.mockResolvedValue({ docs: [{ id: 'a', data: () => ({ val: 1 }) }] });

      const results = await service.getDocuments({
        whereClauses: [{ field: 'active', operator: '==', value: true }],
        // No orderByClauses, limitCount, or startAfterDoc
      });
      expect(results).toHaveLength(1);
    });

    it('returns documents with only limitCount (covers false branches for where/orderBy/startAfter)', async () => {
      mocks.collection.mockReturnValue('colRef');
      mocks.query.mockReturnValue('queryRef');
      mocks.getDocs.mockResolvedValue({ docs: [] });

      const results = await service.getDocuments({ limitCount: 10 });
      expect(results).toHaveLength(0);
    });

    it('returns documents with orderByClauses without direction (covers ?? "asc" fallback)', async () => {
      mocks.collection.mockReturnValue('colRef');
      mocks.query.mockReturnValue('queryRef');
      mocks.getDocs.mockResolvedValue({ docs: [{ id: 'b', data: () => ({ name: 'B' }) }] });

      const results = await service.getDocuments({
        orderByClauses: [{ field: 'name' }], // no direction → uses ?? "asc"
      });
      expect(results).toHaveLength(1);
    });

    it('throws FirestoreServiceError on list failure', async () => {
      mocks.collection.mockReturnValue('colRef');
      mocks.getDocs.mockRejectedValue({ code: 'unavailable', message: 'Server unavailable' });

      await expect(service.getDocuments()).rejects.toThrow(FirestoreServiceError);
    });

    it('throws FirestoreServiceError on list failure with no code (covers ??unknown fallback)', async () => {
      mocks.collection.mockReturnValue('colRef');
      mocks.getDocs.mockRejectedValue({ message: 'Network error' }); // no .code field

      await expect(service.getDocuments()).rejects.toThrow(FirestoreServiceError);
    });
  });

  describe('addDocument', () => {
    it('creates a doc and returns the generated ID', async () => {
      mocks.collection.mockReturnValue('colRef');
      mocks.addDoc.mockResolvedValue({ id: 'newId' });

      const newId = await service.addDocument({
        email: 'john@example.com',
        name: 'John',
      });
      expect(mocks.addDoc).toHaveBeenCalled();
      expect(newId).toBe('newId');
    });

    it('throws FirestoreServiceError on add failure', async () => {
      mocks.collection.mockReturnValue('colRef');
      mocks.addDoc.mockRejectedValue({ code: 'aborted', message: 'Aborted' });

      await expect(service.addDocument({})).rejects.toThrow(FirestoreServiceError);
    });
  });

  describe('updateDocument', () => {
    it('updates a doc with partial data', async () => {
      mocks.doc.mockReturnValue('docRef');
      mocks.updateDoc.mockResolvedValue(undefined);

      await service.updateDocument('doc123', {
        name: 'John Updated',
      });
      expect(mocks.updateDoc).toHaveBeenCalled();
    });

    it('throws FirestoreServiceError on update failure', async () => {
      mocks.doc.mockReturnValue('docRef');
      mocks.updateDoc.mockRejectedValue({ code: 'not-found', message: 'Not found' });

      await expect(service.updateDocument('doc123', {})).rejects.toThrow(FirestoreServiceError);
    });
  });

  describe('deleteDocument', () => {
    it('deletes a doc', async () => {
      mocks.doc.mockReturnValue('docRef');
      mocks.deleteDoc.mockResolvedValue(undefined);

      await service.deleteDocument('doc123');
      expect(mocks.deleteDoc).toHaveBeenCalled();
    });

    it('throws FirestoreServiceError on delete failure', async () => {
      mocks.doc.mockReturnValue('docRef');
      mocks.deleteDoc.mockRejectedValue({ code: 'cancelled', message: 'Cancelled' });

      await expect(service.deleteDocument('doc123')).rejects.toThrow(FirestoreServiceError);
    });
  });

  describe('subscribeToDocument', () => {
    it('calls onSnapshot and handles data updates', () => {
      mocks.doc.mockReturnValue('docRef');
      let snapCallback: (snap: unknown) => void = () => {};
      mocks.onSnapshot.mockImplementation((_ref: unknown, onNext: (snap: unknown) => void) => {
        snapCallback = onNext;
        return () => {};
      });

      const onData = vi.fn();
      service.subscribeToDocument('doc123', onData);

      snapCallback({
        exists: () => true,
        id: 'doc123',
        data: () => ({ name: 'Subscribed' }),
      });

      expect(onData).toHaveBeenCalledWith({ id: 'doc123', name: 'Subscribed' });

      snapCallback({
        exists: () => false,
      });

      expect(onData).toHaveBeenCalledWith(null);
    });

    it('handles subscription error callbacks', () => {
      mocks.doc.mockReturnValue('docRef');
      let errorCallback: (err: unknown) => void = () => {};
      mocks.onSnapshot.mockImplementation((_ref: unknown, _onNext: unknown, onError: (err: unknown) => void) => {
        errorCallback = onError;
        return () => {};
      });

      const onError = vi.fn();
      service.subscribeToDocument('doc123', () => {}, onError);

      errorCallback({ code: 'permission-denied', message: 'Denied' });

      expect(onError).toHaveBeenCalledWith(expect.any(FirestoreServiceError));
    });
  });

  describe('subscribeToCollection', () => {
    it('subscribes to collection snap and triggers callback', () => {
      mocks.collection.mockReturnValue('colRef');
      let snapCallback: (snap: unknown) => void = () => {};
      mocks.onSnapshot.mockImplementation((_q: unknown, onNext: (snap: unknown) => void) => {
        snapCallback = onNext;
        return () => {};
      });

      const onData = vi.fn();
      service.subscribeToCollection(undefined, onData);

      snapCallback({
        docs: [
          { id: '1', data: () => ({ name: 'Doc 1' }) }
        ]
      });

      expect(onData).toHaveBeenCalledWith([{ id: '1', name: 'Doc 1' }]);
    });

    it('handles collection subscription error callbacks', () => {
      mocks.collection.mockReturnValue('colRef');
      let errorCallback: (err: unknown) => void = () => {};
      mocks.onSnapshot.mockImplementation((_q: unknown, _onNext: unknown, onError: (err: unknown) => void) => {
        errorCallback = onError;
        return () => {};
      });

      const onError = vi.fn();
      service.subscribeToCollection(undefined, () => {}, onError);

      errorCallback({ code: 'permission-denied', message: 'Denied' });

      expect(onError).toHaveBeenCalledWith(expect.any(FirestoreServiceError));
    });
  });
});
