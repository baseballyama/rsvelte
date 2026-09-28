import * as $ from 'svelte/internal/server';
import Foo from './Foo.svelte';

export default function Main($$renderer) {
	const Comp = { Foo };
	let visible = false;

	$$renderer.push(`<button>toggle</button> `);

	if (visible) {
		$$renderer.push('<!--[0-->');
		Foo($$renderer, {});
		$$renderer.push(`<!----> `);

		if (Comp.Foo) {
			$$renderer.push('<!--[-->');
			Comp.Foo($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}