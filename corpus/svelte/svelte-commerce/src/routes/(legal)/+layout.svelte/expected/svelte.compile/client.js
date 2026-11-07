import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setCartState, setWishlistState } from '$lib/core/stores/index.js';
import Nav from '$lib/components/nav/nav.svelte';
import Footer from '$lib/components/common/footer.svelte';
import { StorePlugins } from '$lib/core/components/index.js';

var root = $.from_html(`<!> <!> <main id="main" class="min-h-screen"><!></main> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);
	setCartState();
	setWishlistState();

	var fragment = root();
	var node = $.first_child(fragment);

	StorePlugins(node, {});

	var node_1 = $.sibling(node, 2);

	Nav(node_1, {});

	var main = $.sibling(node_1, 2);
	var node_2 = $.child(main);

	$.snippet(node_2, () => $$props.children);
	$.reset(main);

	var node_3 = $.sibling(main, 2);

	Footer(node_3, {});
	$.append($$anchor, fragment);
	$.pop();
}