export type Role = "USER" | "GUARDIAN" | "PROVIDER" | "ADMIN";
export type ProviderStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type ProgramStatus = "DRAFT" | "PUBLISHED" | "SUSPENDED";
export type BookingStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED" | "SESSION_CANCELLED";
export type LedgerType = "PURCHASE" | "BOOKING_HOLD" | "BOOKING_CONFIRMED" | "REFUND" | "PROVIDER_EARNING" | "FEE" | "ADJUSTMENT";
export interface User { id:string; email:string; passwordHash:string; displayName:string; birthDate:string; prefecture:string; city:string; interests:string[]; roles:Role[]; emailVerified:boolean; createdAt:string; deletedAt?:string }
export interface Participant { id:string; ownerId:string; displayName:string; birthDate:string; prefecture:string; city:string; interests:string[]; kind:"SELF"|"CHILD"; createdAt:string }
export interface Provider { id:string; ownerId:string; kind:"COMPANY"|"CLASS"|"CLUB"|"COACH"; name:string; bio:string; prefecture:string; city:string; contact:string; categoryIds:string[]; experience:string; qualifications:string; status:ProviderStatus; createdAt:string; deletedAt?:string }
export interface ProviderDocument { id:string; providerId:string; ownerId:string; privateKey:string; originalName:string; contentType:string; createdAt:string }
export interface ProviderReviewHistory { id:string; providerId:string; actorId:string; fromStatus:ProviderStatus; toStatus:ProviderStatus; comment:string; createdAt:string }
export interface Category { id:string; name:string }
export interface Program { id:string; providerId:string; title:string; categoryId:string; description:string; imageUrl:string; minAge:number; maxAge:number; difficulty:string; coinCost:number; prefecture:string; city:string; location:string; belongings:string; notes:string; status:ProgramStatus; rating:number; createdAt:string; deletedAt?:string }
export interface SessionSlot { id:string; programId:string; startsAt:string; endsAt:string; capacity:number; bookingDeadline:string; location:string; cancelled:boolean; createdAt:string }
export interface Booking { id:string; number:string; userId:string; participantId:string; slotId:string; coinCost:number; status:BookingStatus; createdAt:string; cancelledAt?:string; completedAt?:string }
export interface StatusHistory { id:string; bookingId:string; actorId:string; fromStatus?:BookingStatus; toStatus:BookingStatus; reason:string; createdAt:string }
export interface LedgerEntry { id:string; walletUserId:string; type:LedgerType; amount:number; bookingId?:string; paymentId?:string; providerId?:string; reason:string; reversalOfId?:string; createdAt:string }
export interface PaymentTransaction { id:string; userId:string; providerPaymentId:string; coins:number; status:"PENDING"|"SUCCEEDED"; createdAt:string }
export interface ProviderEarning { id:string; providerId:string; bookingId:string; grossCoins:number; feeCoins:number; netCoins:number; createdAt:string }
export interface Review { id:string; bookingId:string; userId:string; programId:string; rating:number; comment:string; visible:boolean; reported:boolean; createdAt:string }
export interface ReviewReport { id:string; reviewId:string; reporterId:string; reason:string; createdAt:string }
export interface Notification { id:string; userId:string; type:string; message:string; read:boolean; createdAt:string }
export interface WebhookEvent { id:string; providerEventId:string; payloadHash:string; processedAt:string }
export interface AuditLog { id:string; actorId:string; action:string; targetType:string; targetId:string; summary:string; createdAt:string }
export interface ServiceSetting { feePercent:number; appName:string }
export interface Session { id:string; userId:string; csrfToken:string; expiresAt:string }
export interface Database { users:User[]; participants:Participant[]; providers:Provider[]; providerDocuments:ProviderDocument[]; providerReviews:ProviderReviewHistory[]; categories:Category[]; programs:Program[]; slots:SessionSlot[]; bookings:Booking[]; bookingHistory:StatusHistory[]; ledger:LedgerEntry[]; payments:PaymentTransaction[]; earnings:ProviderEarning[]; reviews:Review[]; reviewReports:ReviewReport[]; notifications:Notification[]; webhooks:WebhookEvent[]; auditLogs:AuditLog[]; sessions:Session[]; settings:ServiceSetting }
export interface Actor { userId:string; roles:Role[] }
