import * as $ from 'svelte/internal/server';
import { obj } from "./Data.svelte.js";

export default function Main($$renderer) {
	function replaceProp() {
		Object.assign(obj, { a: 9, b: 10, c: 11 });
	}

	$$renderer.push(`<button>Replace</button> ${$.escape(Object.values(obj))}`);
}