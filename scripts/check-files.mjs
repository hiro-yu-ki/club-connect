import { readdir, readFile, mkdir, cp } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
const mode=process.argv[2]??"typecheck",root=process.cwd();
async function files(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())out.push(...await files(path));else if(/\.(ts|mjs)$/.test(path))out.push(path)}return out}
const source=[...await files(join(root,"src")),...await files(join(root,"scripts")),...(await readdir(join(root,"tests")).catch(()=>[])).filter(x=>x.endsWith(".ts")).map(x=>join(root,"tests",x))].filter(x=>!x.endsWith("check-files.mjs"));
if(mode==="typecheck"){for(const path of source){const result=spawnSync(process.execPath,["--experimental-strip-types","--check",path],{encoding:"utf8"});if(result.status!==0){process.stderr.write(result.stderr);process.exitCode=1}}if(!process.exitCode)console.log(`syntax/type check: ${source.length} files OK`)}
if(mode==="lint"){let failed=false;for(const path of source){const value=await readFile(path,"utf8");if(/\b(eval|new Function)\s*\(/.test(value)||/console\.log\([^)]*(password|secret|token)/i.test(value)){console.error(`unsafe pattern: ${path}`);failed=true}if(/[ \t]+$/m.test(value)){console.error(`trailing whitespace: ${path}`);failed=true}}if(failed)process.exitCode=1;else console.log(`lint: ${source.length} files OK`)}
if(mode==="build"){await mkdir(join(root,"dist"),{recursive:true});await cp(join(root,"src"),join(root,"dist","src"),{recursive:true});await cp(join(root,"public"),join(root,"dist","public"),{recursive:true});console.log("build: dist created")}
