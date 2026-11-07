import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let count = $.state(0);

	let object = {
		toString() {
			return $.get(count);
		}
	};

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, object));
	$.delegated('click', button, () => $.set(count, $.get(count) + 1));
	$.append($$anchor, button);
}

$.delegate(['click']);