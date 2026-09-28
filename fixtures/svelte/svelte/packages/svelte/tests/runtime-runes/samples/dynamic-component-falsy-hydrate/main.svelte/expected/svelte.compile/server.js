import * as $ from 'svelte/internal/server';
import HelloWorld from './HelloWorld.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let Component = void 0;

		$$renderer.push(`<h1>Test</h1> `);

		if (Component) {
			$$renderer.push('<!--[-->');
			Component($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}