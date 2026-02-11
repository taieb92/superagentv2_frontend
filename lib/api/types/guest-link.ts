/**
 * Guest link types
 */

export interface GuestLinkDto {
  id: string;
  token: string;
  url: string;
  contractInstanceId: string;
  guestEmail: string;
  guestName?: string | null;
  expiresAt: string;
  accessedAt?: string | null;
  createdAt: string;
  propertyAddress?: string | null;
  buyerName?: string | null;
  sellerName?: string | null;
}

export interface GuestLinkCreateRequest {
  guestEmail: string;
  guestName?: string;
  expirationHours?: number;
}
