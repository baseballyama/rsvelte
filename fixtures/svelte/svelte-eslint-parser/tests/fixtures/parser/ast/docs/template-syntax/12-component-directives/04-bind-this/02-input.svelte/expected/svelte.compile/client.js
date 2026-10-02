import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <button>Empty shopping cart</button>`, 1);

export default function _2_input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(ShoppingCart(node, {}), ($$value) => cart = $$value, () => cart);

	var button = $.sibling(node, 2);

	$.event('click', button, () => cart.empty());
	$.append($$anchor, fragment);
}