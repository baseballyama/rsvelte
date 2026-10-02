import * as $ from 'svelte/internal/server';
import Component1 from './Component1.svelte';
import Component2 from './Component2.svelte';

export default function Main($$renderer) {
	let Component = Component1;

	let Object = {
		get component() {
			return Component;
		}
	};

	$$renderer.push(`<button>switch</button> `);

	if (Component) {
		$$renderer.push('<!--[-->');
		Component($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` `);

	if (Object.component) {
		$$renderer.push('<!--[-->');
		Object.component($$renderer, {});
		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}