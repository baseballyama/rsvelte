import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	Child($$renderer, {});
	$$renderer.push(`<!----> `);

	if (true) {
		$$renderer.push(`<!--[0--><p>hello</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}