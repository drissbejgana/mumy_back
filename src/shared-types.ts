// Wire-format types this backend's own code references directly (role typing, JWT payload
// shape). Other entities live purely as Mongoose schemas — see src/models/ — since nothing
// here imports them by name. Kept as plain local types (not a shared package) since backend
// and frontend now live in separate repos.

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'transporter' | 'client' | 'driver';
  status: 'pending' | 'verified' | 'suspended';
  companyName?: string;
  phone?: string;
  avatarUrl?: string;
  kycDocUrl?: string;
  kycUploadedAt?: string;
  isFeatured?: boolean;
  ice?: string;
  patente?: string;
  rc?: string;
  ifFiscal?: string;
  cnss?: string;
  kycLicenceUrl?: string;
  kycLicenceStatus?: 'missing' | 'pending' | 'verified' | 'rejected';
  kycRcUrl?: string;
  kycRcStatus?: 'missing' | 'pending' | 'verified' | 'rejected';
  kycInsuranceUrl?: string;
  kycInsuranceStatus?: 'missing' | 'pending' | 'verified' | 'rejected';
  kycPatenteUrl?: string;
  kycPatenteStatus?: 'missing' | 'pending' | 'verified' | 'rejected';
  kycRejectReason?: string;
  errorCount?: number;
  riskErrors?: Array<{ id: string; type: string; date: string; description: string; resolved: boolean }>;
  lastLoginAt?: string;
  googleId?: string;
}

export interface JwtPayload {
  sub: string;
  role: User['role'];
  email: string;
  iat?: number;
  exp?: number;
}
