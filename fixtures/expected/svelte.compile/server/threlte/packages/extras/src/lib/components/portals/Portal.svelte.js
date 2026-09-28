import * as $ from 'svelte/internal/server';
import { usePortalContext } from './usePortalContext.svelte.js';
import { SvelteSet } from 'svelte/reactivity';

export default function Portal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { id = 'default', object, children } = $$props;

		// @Todo Remove in Threlte 9
		const portals = usePortalContext();
	});
}