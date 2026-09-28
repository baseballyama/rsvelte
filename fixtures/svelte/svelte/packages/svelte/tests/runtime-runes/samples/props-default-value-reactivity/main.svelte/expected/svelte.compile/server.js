import * as $ from 'svelte/internal/server';
import Sub from './sub.svelte';
import { set_translation } from './translations.svelte.js';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Sub($$renderer, {});
		$$renderer.push(`<!----> <button>Change Language</button>`);
	});
}