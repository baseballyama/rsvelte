import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <button> </button>`, 1);

export default function Main($$anchor) {
	let items = $.proxy([{ a: 0 }]);
	let start = $.snapshot(items);

	$.next();

	var fragment = root();
	var text = $.first_child(fragment);
	var button = $.sibling(text);
	var text_1 = $.only_child(button, true);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, `${$0 ?? ''} `);
			$.set_text(text_1, $1);
		},
		[
			() => JSON.stringify(start),
			() => JSON.stringify(structuredClone($.snapshot(items)))
		]
	);

	$.event('click', button, () => items.push({ a: items.length }));
	$.append($$anchor, fragment);
}