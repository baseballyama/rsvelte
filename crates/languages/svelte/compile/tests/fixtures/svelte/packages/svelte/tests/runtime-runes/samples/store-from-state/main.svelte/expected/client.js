import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable, fromStore } from 'svelte/store';

var root = $.from_html(` <button>Increment</button><br/> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = writable(0);
	const state_from_store = fromStore(store);

	const derived_value = $.derived(() => {
		if (state_from_store.current > 10) {
			return state_from_store.current;
		} else {
			return 10;
		}
	});

	function increment() {
		$.store_set(store, $store() + 1);
	}

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var button = $.sibling(text);
	var node = $.sibling(button, 3);

	{
		var consequent = ($$anchor) => {
			var text_1 = $.text('Exceeded 10!');

			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if ($.get(derived_value) > 10) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, `${state_from_store.current ?? ''} `));
	$.delegated('click', button, increment);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);