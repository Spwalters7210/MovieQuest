// Run with: node --test tests/recommender.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {newProfile,applyChoice,recommend,scoreMovie} from '../src/common/recommender.js';
import {MOVIES} from '../src/common/movie-data.js';
test('new profile has all four attributes',()=>assert.deepEqual(newProfile(),{mystery:1,suspense:1,humor:1,action:1}));
test('choice effects update and clamp values',()=>{const p=newProfile();applyChoice(p,{mystery:10,humor:-5});assert.equal(p.mystery,5);assert.equal(p.humor,0);});
test('scores are deterministic',()=>{const p=newProfile();assert.equal(scoreMovie(p,MOVIES[0]),scoreMovie(p,MOVIES[0]));});
test('rankings are descending',()=>{const r=recommend(newProfile());assert.ok(r.every((v,i)=>i===0||r[i-1].score>=v.score));});
