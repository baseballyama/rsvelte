import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let thisBug;

	function Bug($$renderer) {
		$$renderer.push(`<!---->cool`);
	}

	$$renderer.push(`<form></form> ${$.escape(typeof thisBug)}`);
}