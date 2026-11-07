import * as $ from 'svelte/internal/server';
import { injectPlugin } from '@threlte/core';

export default function InjectPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { name, plugin, children } = $$props;

		injectPlugin(name, plugin);
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}