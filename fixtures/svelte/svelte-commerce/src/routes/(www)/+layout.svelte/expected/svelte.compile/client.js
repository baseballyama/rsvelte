import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setCartState, setProductState, setWishlistState } from '$lib/core/stores/index.js';
import Nav from '$lib/components/nav/nav.svelte';
import Footer from '$lib/components/common/footer.svelte';
import { StorePlugins } from '$lib/core/components/index.js';
import ConversationalShopping from '$lib/components/chat/conversational-shopping.svelte';

var root = $.from_html(`<div class="flex min-h-screen flex-col justify-between"><a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[10000001] focus:rounded focus:bg-white focus:p-3 focus:shadow">Skip to main content</a> <!> <main id="main" class="inter-gap flex min-h-screen flex-1 flex-col"><!></main> <!></div> <!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);
	setCartState();
	setProductState();
	setWishlistState();

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Nav(node, {});

	var main = $.sibling(node, 2);
	var node_1 = $.child(main);

	$.snippet(node_1, () => $$props.children);
	$.reset(main);

	var node_2 = $.sibling(main, 2);

	Footer(node_2, {});
	$.reset(div);

	var node_3 = $.sibling(div, 2);

	StorePlugins(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	ConversationalShopping(node_4, {});
	$.append($$anchor, fragment);
	$.pop();
}