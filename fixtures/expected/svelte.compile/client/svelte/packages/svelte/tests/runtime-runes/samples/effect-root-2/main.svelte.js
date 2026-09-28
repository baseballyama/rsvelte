import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button>cleanup</button>`, 1);

export default function Main($$anchor) {
	let x = $.state(0);

	const cleanup = $.effect_root(() => {
		console.log($.get(x));

		return () => console.log('cleanup');
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);

	$.template_effect(() => $.set_text(text, $.get(x)));
	$.delegated('click', button, () => $.update(x));
	$.delegated('click', button_1, cleanup);
	$.append($$anchor, fragment);
}

$.delegate(['click']);