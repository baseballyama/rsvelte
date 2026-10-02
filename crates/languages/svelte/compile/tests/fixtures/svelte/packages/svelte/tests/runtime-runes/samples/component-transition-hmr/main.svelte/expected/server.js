import * as $ from 'svelte/internal/server';
import Red from "./Red.svelte";
import Blue from "./Blue.svelte";

export default function Main($$renderer) {
	const comps = { Red, Blue };
	let activeComp = "Red";

	$$renderer.push(`<main><button>toggle</button> `);

	if (comps[activeComp]) {
		$$renderer.push('<!--[-->');
		comps[activeComp]($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</main>`);
}