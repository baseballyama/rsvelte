import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { handler, log_a, log_b } from './event.svelte.js';

var root = $.from_html(`<button>click</button> <button>change</button> <button>change back</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.delegated('click', button, function (...$$args) {
		handler.value?.apply(this, $$args);
	});

	$.delegated('click', button_1, () => handler.value = log_b);
	$.delegated('click', button_2, () => handler.value = log_a);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);