import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	const id = $.props_id($$renderer);
	let show = false;

	$$renderer.push(`<button>toggle</button> <h1>${$.escape(id)}</h1> `);
	Child($$renderer, {});
	$$renderer.push(`<!----> `);
	Child($$renderer, {});
	$$renderer.push(`<!----> `);
	Child($$renderer, {});
	$$renderer.push(`<!----> `);

	if (show) {
		$$renderer.push('<!--[0-->');
		Child($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}