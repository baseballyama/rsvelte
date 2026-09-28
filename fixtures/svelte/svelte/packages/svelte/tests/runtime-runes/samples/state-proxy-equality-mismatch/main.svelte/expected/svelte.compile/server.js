import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let primitive = 'foo';
	let object = {};
	let array = [primitive, object];

	$$renderer.push(`<button>array.includes(primitive)</button> <button>array.includes(object)</button> <hr/> <button>array.indexOf(primitive)</button> <button>array.indexOf(object)</button> <hr/> <button>array.lastIndexOf(primitive)</button> <button>array.lastIndexOf(object)</button> <hr/> <button>clear</button>`);
}