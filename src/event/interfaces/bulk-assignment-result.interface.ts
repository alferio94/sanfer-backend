export interface BulkAssignmentResult {
  /** Number of new EventUser records created in this request */
  created: number;
  /** Number of EventUser records that already existed */
  existing: number;
  /** Total number of assignments (new + already existing) for this batch */
  assigned: number;
}
