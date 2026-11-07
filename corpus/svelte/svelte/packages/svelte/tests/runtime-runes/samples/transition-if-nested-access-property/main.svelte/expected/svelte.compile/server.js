import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function Main($$renderer) {
	let data = { id: 1 };

	$$renderer.push(`<button>clear</button> `);

	if (data) {
		$$renderer.push(`<!--[0--><!---->`);

		{
			$$renderer.push(`<p>keyed</p>`);
		}

		$$renderer.push(`<!----> `);

		if (data.id) {
			$$renderer.push(`<!--[0--><p>sibling</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}