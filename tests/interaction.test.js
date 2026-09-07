import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createRoom} from '../src/world/room.js';
import {createToys, toyDefinitions} from '../src/world/toys.js';
import {Yueyue} from '../src/character/Yueyue.js';
import {Director} from '../src/behaviors/Director.js';
import {route,blocked} from '../src/behaviors/navigation.js';
function setup(){const scene=new THREE.Scene(),toys=createToys(scene),character=new Yueyue(scene),director=new Director(character,toys,()=>{});return {scene,toys,character,director};}
function tick(d,n){for(let i=0;i<n*60;i++)d.update(1/60)}
function arrive(d,toy){d.select(toy);let frames=0;while(d.state==='walk'&&frames++<3600)d.update(1/60);assert.equal(d.state,'play');}
test('all toy-to-toy routes clear the castle and slide',()=>{for(const a of toyDefinitions)for(const b of toyDefinitions){const path=route({x:a.approach[0],z:a.approach[1]},{x:b.approach[0],z:b.approach[1]});assert.ok(path.length,`${a.id} to ${b.id}`);let prev={x:a.approach[0],z:a.approach[1]};for(const p of path){for(let t=0;t<=1;t+=.05)assert.ok(!blocked(prev.x+(p.x-prev.x)*t,prev.z+(p.z-prev.z)*t),`${a.id} to ${b.id}`);prev=p;}}});
test('real room and articulated models contain no invalid geometry or transforms',()=>{const {scene,toys,character,director}=setup();createRoom(scene);for(const toy of toys){arrive(director,toy);tick(director,toy.duration+.03);scene.updateMatrixWorld(true);scene.traverse(o=>{assert.ok(o.matrixWorld.elements.every(Number.isFinite),o.type);if(o.geometry?.attributes.position)assert.ok(o.geometry.attributes.position.array.every(Number.isFinite),`${toy.id} geometry`)});assert.equal(director.state,'idle');}});
test('changing invitation while holding a book preserves the prop and returns it before walking',()=>{const {director,toys}=setup();const book=toys.find(t=>t.id==='books'),rest=book.parts.moving.position.clone();arrive(director,book);tick(director,4);const held=book.parts.moving.position.clone();director.select(toys[1]);assert.equal(director.state,'play');assert.deepEqual(book.parts.moving.position,held);tick(director,book.duration-4+.03);assert.ok(book.parts.moving.position.distanceTo(rest)<1e-8);tick(director,1);assert.equal(director.current.id,'blocks');});
test('two-bone IK wrist meets a reachable world-space target',()=>{const {character}=setup();character.root.rotation.y=.8;const arm=character.armRig[0];character.root.updateMatrixWorld(true);const shoulder=arm.shoulder.getWorldPosition(new THREE.Vector3()),target=shoulder.clone().add(new THREE.Vector3(.08,-.19,.15));character.reach(0,target);assert.ok(character.handPosition(0).distanceTo(target)<1e-5);});
test('ball slows through friction and remains at its new location after playing',()=>{const {director,toys}=setup();const ball=toys.find(t=>t.id==='ball');arrive(director,ball);tick(director,ball.duration-.05);const before=ball.parts.moving.position.clone();tick(director,.1);assert.ok(ball.parts.moving.position.x>0);assert.ok(ball.parts.moving.position.distanceTo(before)<.02);assert.ok(ball.position[0]+ball.parts.moving.position.x<=4.16);});
