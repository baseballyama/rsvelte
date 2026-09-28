import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Item from './Item.svelte';

var root = $.from_html(`<!> <p> </p>`, 1);

export default function Main($$anchor) {
	let item = $.proxy({ heading: 'initial' });
	var fragment = root();
	var node = $.first_child(fragment);

	Item(node, {
		get item() {
			return item;
		}
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, item.heading));
	$.append($$anchor, fragment);
}