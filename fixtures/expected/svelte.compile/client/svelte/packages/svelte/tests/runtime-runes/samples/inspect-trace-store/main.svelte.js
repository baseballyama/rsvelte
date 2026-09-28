import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $count = () => $.store_get(count, '$count', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const count = writable(0);

	$.user_effect(() => {
		$count();
	});

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$count() ?? ''}`));
	$.delegated('click', button, () => $.store_set(count, $count() + 1));
	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);