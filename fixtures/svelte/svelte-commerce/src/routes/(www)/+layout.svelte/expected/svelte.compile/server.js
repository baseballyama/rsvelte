import * as $ from 'svelte/internal/server';
import { setCartState, setProductState, setWishlistState } from '$lib/core/stores/index.js';
import Nav from '$lib/components/nav/nav.svelte';
import Footer from '$lib/components/common/footer.svelte';
import { StorePlugins } from '$lib/core/components/index.js';
import ConversationalShopping from '$lib/components/chat/conversational-shopping.svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children } = $$props;

		setCartState();
		setProductState();
		setWishlistState();
		$$renderer.push(`<div class="flex min-h-screen flex-col justify-between"><a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[10000001] focus:rounded focus:bg-white focus:p-3 focus:shadow">Skip to main content</a> `);
		Nav($$renderer, {});
		$$renderer.push(`<!----> <main id="main" class="inter-gap flex min-h-screen flex-1 flex-col">`);
		children($$renderer);
		$$renderer.push(`<!----></main> `);
		Footer($$renderer, {});
		$$renderer.push(`<!----></div> `);
		StorePlugins($$renderer, {});
		$$renderer.push(`<!----> `);
		ConversationalShopping($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}