import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<svg></svg> <button></button>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	var fragment = root();
	var svg = $.first_child(fragment);
	var button = $.sibling(svg, 2);

	$.template_effect(() => $.set_class(svg, 0, $.clsx($.get(count))));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);