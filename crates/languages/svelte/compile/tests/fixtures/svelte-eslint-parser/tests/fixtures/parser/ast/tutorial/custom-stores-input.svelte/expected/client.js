import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { count } from './stores.js';

var root = $.from_html(`<h1> </h1> <button>+</button> <button>-</button> <button>reset</button>`, 1);

export default function Custom_stores_input($$anchor, $$props) {
	$.push($$props, true);

	const $count = () => $.store_get(count, '$count', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);
	var button = $.sibling(h1, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.template_effect(() => $.set_text(text, `The count is ${$count() ?? ''}`));

	$.event('click', button, function (...$$args) {
		count.increment?.apply(this, $$args);
	});

	$.event('click', button_1, function (...$$args) {
		count.decrement?.apply(this, $$args);
	});

	$.event('click', button_2, function (...$$args) {
		count.reset?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}