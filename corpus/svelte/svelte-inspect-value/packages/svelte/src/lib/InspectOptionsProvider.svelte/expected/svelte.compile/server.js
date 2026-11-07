import * as $ from 'svelte/internal/server';
import { setGlobalInspectOptions } from './options.svelte.js';

export default function InspectOptionsProvider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, options } = $$props;

		setGlobalInspectOptions(() => options);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}