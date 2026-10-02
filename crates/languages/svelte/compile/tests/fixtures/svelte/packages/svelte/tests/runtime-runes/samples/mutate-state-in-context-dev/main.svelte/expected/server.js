import * as $ from 'svelte/internal/server';

let obj = {};

obj.test = "hi!";

export default function Main($$renderer) {
	$$renderer.push(`<h1>Values: ${$.escape(JSON.stringify(obj))}</h1>`);
}