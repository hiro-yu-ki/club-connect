import test from "node:test";import assert from "node:assert/strict";
import {ageOn,canReview,canTransitionBooking,canTransitionProvider,feeFor,refundFor} from "../src/domain.ts";import {requireRole} from "../src/security.ts";
test("対象年齢は開催日時点で判定する",()=>{assert.equal(ageOn("2010-09-11","2026-09-10T00:00:00Z"),15);assert.equal(ageOn("2010-09-10","2026-09-10T00:00:00Z"),16)});
test("コインと手数料は整数で切り捨てる",()=>{assert.equal(feeFor(999,10),99)});
test("24時間前までと提供者中止は全額返還",()=>{assert.equal(refundFor("2026-01-02T12:00:00Z","2026-01-01T12:00:00Z"),"FULL");assert.equal(refundFor("2026-01-02T12:00:00Z","2026-01-02T00:00:01Z"),"NONE");assert.equal(refundFor("2026-01-02T12:00:00Z","2026-01-02T11:00:00Z",true),"FULL")});
test("予約と審査の状態遷移を制限する",()=>{assert.equal(canTransitionBooking("CONFIRMED","COMPLETED"),true);assert.equal(canTransitionBooking("CANCELLED","COMPLETED"),false);assert.equal(canTransitionProvider("PENDING","APPROVED"),true);assert.equal(canTransitionProvider("DRAFT","APPROVED"),false)});
test("完了した本人予約だけレビューできる",()=>{const booking={id:"b",number:"n",userId:"u",participantId:"p",slotId:"s",coinCost:1,status:"COMPLETED" as const,createdAt:""};assert.equal(canReview(booking,{userId:"u",roles:["USER"]},false,"provider"),true);assert.equal(canReview(booking,{userId:"x",roles:["USER"]},false,"provider"),false);assert.equal(canReview(booking,{userId:"u",roles:["USER"]},true,"provider"),false)});
test("role別認可",()=>{assert.doesNotThrow(()=>requireRole({userId:"a",roles:["ADMIN"]},["ADMIN"]));assert.throws(()=>requireRole({userId:"u",roles:["USER"]},["ADMIN"]),/権限/)});
