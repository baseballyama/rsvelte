import * as $ from 'svelte/internal/server';
import { createThrelteContext } from '../../context/createThrelteContext.svelte.js';

export default function Context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, $$slots, $$events, ...rest } = $$props;

		createThrelteContext(() => rest);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}