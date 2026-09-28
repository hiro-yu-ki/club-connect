import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { Database } from "./types.ts";
export const emptyDatabase = ():Database => ({ users:[],participants:[],providers:[],providerDocuments:[],providerReviews:[],categories:[],programs:[],slots:[],bookings:[],bookingHistory:[],ledger:[],payments:[],earnings:[],reviews:[],reviewReports:[],notifications:[],webhooks:[],auditLogs:[],sessions:[],settings:{feePercent:10,appName:process.env.APP_NAME||"ClubConnect"} });
export interface Store { read():Promise<Database>; transaction<T>(fn:(db:Database)=>Promise<T>|T):Promise<T> }
export class MemoryStore implements Store {
  private db:Database; private queue:Promise<void>=Promise.resolve();
  constructor(initial:Database=emptyDatabase()){this.db=structuredClone(initial)}
  async read(){return structuredClone(this.db)}
  async transaction<T>(fn:(db:Database)=>Promise<T>|T):Promise<T>{let release!:()=>void;const previous=this.queue;this.queue=new Promise<void>(r=>{release=r});await previous;try{const draft=structuredClone(this.db);const result=await fn(draft);this.db=draft;return result}finally{release()}}
}
export class JsonFileStore implements Store {
  private memory:MemoryStore|undefined;
  private readonly path:string;
  constructor(path:string){this.path=path}
  private async get(){if(this.memory)return this.memory;let db:Database;try{db=JSON.parse(await readFile(this.path,"utf8")) as Database}catch{db=emptyDatabase()}this.memory=new MemoryStore(db);return this.memory}
  async read(){return(await this.get()).read()}
  async transaction<T>(fn:(db:Database)=>Promise<T>|T):Promise<T>{const result=await(await this.get()).transaction(fn);const db=await this.memory!.read();await mkdir(dirname(this.path),{recursive:true});const tmp=`${this.path}.tmp`;await writeFile(tmp,JSON.stringify(db,null,2),{encoding:"utf8",mode:0o600});await rename(tmp,this.path);return result}
}
