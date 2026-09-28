import * as $ from 'svelte/internal/server';
import Foo from './Foo.svelte';

export default function Main($$renderer) {
	/** @type {typeof Foo | null} */
	let component = null;

	let show = true;

	$$renderer.push(`<button>toggle component</button> <button>toggle show</button> `);

	if (show) {
		$$renderer.push('<!--[0-->');

		if (component) {
			$$renderer.push('<!--[-->');
			component($$renderer, {});
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