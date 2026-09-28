import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let foo = $.state(false);
	let bar = $.derived(() => $.get(foo));

	$.user_effect(() => {
		console.log('up', { foo: $.get(foo), bar: $.get(bar) });

		return () => {
			console.log('down', { foo: $.get(foo), bar: $.get(bar) });
		};
	});

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `toggle (${$.get(foo) ?? ''})`));
	$.delegated('click', button, () => $.set(foo, !$.get(foo)));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);