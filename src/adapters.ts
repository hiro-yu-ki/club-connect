import { createHmac } from "node:crypto";

export interface EmailAdapter { send(to:string, subject:string, body:string):Promise<void> }
export class MockEmailAdapter implements EmailAdapter {
  readonly sent:{to:string;subject:string;body:string}[]=[];
  async send(to:string,subject:string,body:string){this.sent.push({to,subject,body});}
}
export class HttpEmailAdapter implements EmailAdapter {
  private apiKey:string;private from:string;private endpoint:string;
  constructor(apiKey:string,from:string,endpoint:string){this.apiKey=apiKey;this.from=from;this.endpoint=endpoint}
  async send(to:string,subject:string,body:string){const response=await fetch(this.endpoint,{method:"POST",headers:{authorization:`Bearer ${this.apiKey}`,"content-type":"application/json"},body:JSON.stringify({from:this.from,to,subject,text:body})});if(!response.ok)throw new Error(`メール送信失敗: ${response.status}`);}
}
export interface PaymentAdapter { createTestPayment(userId:string,coins:number):Promise<{paymentId:string;eventId:string;raw:string;signature:string}> }
export class MockPaymentAdapter implements PaymentAdapter {
  async createTestPayment(userId:string,coins:number){const paymentId=`mock_${Date.now()}`,eventId=`evt_${paymentId}`,raw=JSON.stringify({eventId,paymentId,userId,coins});return{paymentId,eventId,raw,signature:"mock"};}
}
export const webhookSignature=(raw:string,secret:string)=>createHmac("sha256",secret).update(raw).digest("hex");
export interface PrivateStorageAdapter { put(key:string,bytes:Uint8Array,contentType:string):Promise<void>; signedUrl(key:string,expiresSeconds:number):Promise<string> }
export class MemoryPrivateStorage implements PrivateStorageAdapter { private files=new Map<string,{bytes:Uint8Array;contentType:string}>();async put(key:string,bytes:Uint8Array,contentType:string){this.files.set(key,{bytes:bytes.slice(),contentType});}async signedUrl(key:string,expiresSeconds:number){if(!this.files.has(key))throw new Error("ファイルが見つかりません");return`memory-private://${encodeURIComponent(key)}?expires=${Date.now()+expiresSeconds*1000}`;} }
