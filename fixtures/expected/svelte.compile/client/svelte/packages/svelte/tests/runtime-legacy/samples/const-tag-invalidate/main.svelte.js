import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> <button>Toggle</button></div>`);

export default function Main($$anchor) {
	let items = [
		{ name: 'A', selected: true },
		{ name: 'B', selected: false },
		{ name: 'C', selected: false }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => items, $.index, ($$anchor, item, $$index) => {
		const toggle = $.derived(() => () => ($.get(item).selected = !$.get(item).selected));
		var div = root();
		var text = $.child(div);
		var button = $.sibling(text);

		$.reset(div);

		$.template_effect(() => $.set_text(text, `${$.get(item).selected ? '[Y]' : '[N]'}
		${$.get(item).name ?? ''} `));

		$.event('click', button, function (...$$args) {
			$.get(toggle)?.apply(this, $$args);
		});

		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}