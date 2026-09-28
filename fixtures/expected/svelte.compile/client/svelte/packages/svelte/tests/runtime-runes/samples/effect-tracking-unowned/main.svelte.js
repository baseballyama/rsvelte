import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable, fromStore, toStore } from "svelte/store";

var root = $.from_html(`<o> </o> <p> </p> <button>Change Store</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = writable("previous");
	let text = $.derived(() => fromStore(store).current + " message");

	$.get(text // read derived in a non-tracking context
	);

	var fragment = root();
	var o = $.first_child(fragment);
	var text_1 = $.only_child(o);
	var p = $.sibling(o, 2);
	var text_2 = $.only_child(p);
	var button = $.sibling(p, 2);

	$.template_effect(() => {
		$.set_text(text_1, `Store: ${$store() ?? ''}`);
		$.set_text(text_2, `Text: ${$.get(text) ?? ''}`);
	});

	$.delegated('click', button, () => {
		store.set("new");
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);