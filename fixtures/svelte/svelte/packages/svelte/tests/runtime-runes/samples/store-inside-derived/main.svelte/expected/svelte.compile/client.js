import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fromStore, writable } from 'svelte/store';

var root = $.from_html(`<div> </div> <div> </div> <div> </div> <button>Loading</button> <button>Increment</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $value = () => $.store_get(value, '$value', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let isLoading = $.state(false);
	const value = writable(0);
	const valueFromStore = fromStore(value);
	const valueDerivedCurrent = $.derived(() => valueFromStore.current);
	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1);
	var div_2 = $.sibling(div_1, 2);
	var text_2 = $.only_child(div_2);
	var button = $.sibling(div_2, 2);
	var button_1 = $.sibling(button, 2);

	$.template_effect(() => {
		$.set_text(text, `$value: ${($.get(isLoading) ? 'Loading...' : $value()) ?? ''}`);
		$.set_text(text_1, `valueFromStore.current: ${($.get(isLoading) ? 'Loading...' : valueFromStore.current) ?? ''}`);
		$.set_text(text_2, `valueDerivedCurrent: ${($.get(isLoading) ? 'Loading...' : $.get(valueDerivedCurrent)) ?? ''}`);
	});

	$.delegated('click', button, () => {
		$.set(isLoading, true);
	});

	$.delegated('click', button_1, () => {
		$.update_store(value, $value());
		$.set(isLoading, false);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);