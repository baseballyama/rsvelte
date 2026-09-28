import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<p> </p> <p> </p> <button>+1</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $test_store = () => $.store_get(test_store, '$test_store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let test_store = writable({ id: 0 });
	let counter = $.state(3);

	$.user_effect(() => {
		$.store_mutate(test_store, $.untrack($test_store).id = $.get(counter), $.untrack($test_store));
	});

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);
	var button = $.sibling(p_1, 2);

	$.template_effect(() => {
		$.set_text(text, `test_store: ${$test_store().id ?? ''}`);
		$.set_text(text_1, `counter: ${$.get(counter) ?? ''}`);
	});

	$.delegated('click', button, () => $.update(counter));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);