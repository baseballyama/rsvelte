import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from "svelte";

var root = $.from_html(` <br/> <button>increment</button> <br/> <button>reset</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let reset = $.state(false);

	$.user_effect(() => {
		if ($.get(reset)) {
			$.set(count, 0);
			$.set(reset, false);

			return;
		}

		if ($.get(count) <= 10) {
			untrack(() => $.update(count));
		} else {
			$.set(count, "Over 10");
		}
	});

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var button = $.sibling(text, 3);
	var button_1 = $.sibling(button, 4);

	$.template_effect(() => $.set_text(text, `${$.get(count) ?? ''} `));
	$.event('click', button, () => $.update(count));
	$.event('click', button_1, () => $.set(reset, true));
	$.append($$anchor, fragment);
	$.pop();
}