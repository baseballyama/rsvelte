import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { with_root } from './root.svelte.js';

var root = $.from_html(`<button> </button> <button> </button> <button>cleanup</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let x = $.state(0);
	let y = $.state(0);
	const cleanup = with_root(() => $.get(x));
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1, true);
	var button_2 = $.sibling(button_1, 2);

	$.template_effect(() => {
		$.set_text(text, $.get(x));
		$.set_text(text_1, $.get(y));
	});

	$.delegated('click', button, () => $.update(x));
	$.delegated('click', button_1, () => $.update(y));
	$.delegated('click', button_2, cleanup);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);