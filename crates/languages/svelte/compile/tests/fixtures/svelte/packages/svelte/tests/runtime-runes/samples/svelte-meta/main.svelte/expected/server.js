import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let condition = false;

	$$renderer.push(`<button>toggle</button> <p>before</p> `);

	if (condition) {
		$$renderer.push(`<!--[0--><strong>during</strong>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <p>after</p>`);
}