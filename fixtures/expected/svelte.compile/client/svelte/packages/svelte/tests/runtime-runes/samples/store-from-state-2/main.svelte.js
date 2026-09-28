import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fromStore } from 'svelte/store';
import { writable } from 'svelte/store';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div> </div> <!> <button>increment</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = writable(0);
	const value = fromStore(store);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var text = $.only_child(div, true);
	var node = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			const doubled = $.derived(() => value.current * 2);
			var div_1 = root();
			var text_1 = $.only_child(div_1);

			$.template_effect(() => $.set_text(text_1, `${value.current ?? ''}, ${$.get(doubled) ?? ''}`));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var button = $.sibling(node, 2);

	$.template_effect(() => $.set_text(text, $store()));
	$.delegated('click', button, () => $.update_store(store, $store()));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);