import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {floorHeightAt} from '../src/world/surfaces.js';
import {Director} from '../src/behaviors/Director.js';
import {toyDefinitions} from '../src/world/toys.js';
function setup(){const character={root:new THREE.Group(),pose(type){this.lastPose=type}};character.root.position.y=.23;const toys=toyDefinitions.map(d=>({...d,root:new THREE.Group(),parts:{moving:new THREE.Group(),bars:Array.from({length:7},()=>new THREE.Object3D())}}));toys.forEach(t=>t.root.position.set(t.position[0],.23,t.position[1]));return {character,toys,director:new Director(character,toys,()=>{})};}
function advance(d,seconds){for(let i=0;i<seconds*60;i++)d.update(1/60)}
test('each toy is reachable and dispatches its behavior, then returns to idle',()=>{for(const definition of toyDefinitions){const {director,toys,character}=setup();const toy=toys.find(t=>t.id===definition.id);director.select(toy);let frames=0;while(director.state==='walk'&&frames++<1800)director.update(1/60);assert.equal(director.state,'play',definition.id);advance(director,.2);assert.ok(Number.isFinite(character.root.position.y));advance(director,definition.duration);assert.equal(director.state,'idle',definition.id);assert.equal(character.root.position.y,floorHeightAt(character.root.position.x,character.root.position.z)+.005);}});
test('pause freezes movement and simulation time',()=>{const {director,toys,character}=setup();director.select(toys[1]);director.paused=true;const before=character.root.position.clone();advance(director,5);assert.equal(director.time,0);assert.deepEqual(character.root.position,before);});
test('castle animation rises above the mat and returns safely after sliding',()=>{const {director,toys,character}=setup();director.select(toys[0]);while(director.state==='walk')director.update(1/60);advance(director,6.5);assert.ok(character.root.position.y>1.5);advance(director,5);assert.equal(character.root.position.y,.23);});
