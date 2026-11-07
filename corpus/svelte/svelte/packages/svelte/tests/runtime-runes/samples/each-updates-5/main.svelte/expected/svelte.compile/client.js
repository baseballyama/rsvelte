import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from "svelte/store";

var root = $.from_html(`<!> <!> <!> <!> <button>+</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const $storeDeeper = () => $.store_get(storeDeeper, '$storeDeeper', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let store = writable([{ value: 1 }]);
	let storeDeeper = writable({ items: [{ value: 1 }] });

	function increment() {
		$.store_mutate(store, $.untrack($store)[0].value++, $.untrack($store));
		$.store_mutate(storeDeeper, $.untrack($storeDeeper).items[0].value++, $.untrack($storeDeeper));
	}

	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 1, $store, (item) => item, ($$anchor, item) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, $.get(item).value));
		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 1, () => $storeDeeper().items, (item) => item, ($$anchor, item) => {
		$.next();

		var text_1 = $.text();

		$.template_effect(() => $.set_text(text_1, $.get(item).value));
		$.append($$anchor, text_1);
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 1, $store, $.index, ($$anchor, item) => {
		$.next();

		var text_2 = $.text();

		$.template_effect(() => $.set_text(text_2, $.get(item).value));
		$.append($$anchor, text_2);
	});

	var node_3 = $.sibling(node_2, 2);

	$.each(node_3, 1, () => $storeDeeper().items, $.index, ($$anchor, item) => {
		$.next();

		var text_3 = $.text();

		$.template_effect(() => $.set_text(text_3, $.get(item).value));
		$.append($$anchor, text_3);
	});

	var button = $.sibling(node_3, 2);

	$.delegated('click', button, increment);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);