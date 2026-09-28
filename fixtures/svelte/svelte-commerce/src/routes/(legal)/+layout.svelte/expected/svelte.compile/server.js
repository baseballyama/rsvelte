import * as $ from 'svelte/internal/server';
import { setCartState, setWishlistState } from '$lib/core/stores/index.js';
import Nav from '$lib/components/nav/nav.svelte';
import Footer from '$lib/components/common/footer.svelte';
import { StorePlugins } from '$lib/core/components/index.js';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		setCartState();
		setWishlistState();
		StorePlugins($$renderer, {});
		$$renderer.push(`<!----> `);
		Nav($$renderer, {});
		$$renderer.push(`<!----> <main id="main" class="min-h-screen">`);
		children($$renderer);
		$$renderer.push(`<!----></main> `);
		Footer($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}