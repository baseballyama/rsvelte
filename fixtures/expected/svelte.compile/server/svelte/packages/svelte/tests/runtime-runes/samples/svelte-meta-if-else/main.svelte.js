import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<p>before</p> `);

	if (false) {
		$$renderer.push(`<!--[0--><p>during</p>`);
	} else if (true) {
		$$renderer.push(`<!--[1--><p>during</p>`);
	} else if (false) {
		$$renderer.push(`<!--[2--><p>during</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <p>after</p>`);
}