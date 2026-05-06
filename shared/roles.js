/**
 * User role constants shared between server and client.
 * Import this in both server middleware/models and client role-guard components.
 */
export const ROLES = {
  PATIENT: 'patient',
  PHARMACIST: 'pharmacist',
  ADMIN: 'admin',
}

export default ROLES
