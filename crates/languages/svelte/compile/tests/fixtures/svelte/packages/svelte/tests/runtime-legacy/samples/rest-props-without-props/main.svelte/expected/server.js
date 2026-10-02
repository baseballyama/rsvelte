import * as $ from 'svelte/internal/server';
import App from './App.svelte';

export default function Main($$renderer) {
	let a = 1;
	let b = 2;
	let c = 3;
	let d = 4;
	let e = 5;
	let f = { foo: 1 };

	function updateProps() {
		a = 31;
		b = 32;
	}

	function updateRest() {
		d = 34;
	}

	function updateSpread() {
		f.foo = 31;
	}

	function updateSpread2() {
		f.bar = 2;
	}

	App($$renderer, $.spread_props([{ a, b, c, d, e }, f]));
	$$renderer.push(`<!----> <button></button> <button></button> <button></button> <button></button>`);
}