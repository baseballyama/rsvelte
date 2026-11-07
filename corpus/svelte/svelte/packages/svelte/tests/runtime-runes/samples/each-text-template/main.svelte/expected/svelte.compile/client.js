import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <br/>`, 1);
var root_1 = $.from_html(`<p></p>`);

export default function Main($$anchor) {
	let array = $.proxy(['A', 'B', 'C']);
	var p = root_1();

	$.each(p, 21, () => array, $.index, ($$anchor, a) => {
		$.next();

		var fragment = root();
		var text = $.first_child(fragment, true);

		$.next();
		$.template_effect(() => $.set_text(text, $.get(a)));
		$.append($$anchor, fragment);
	});

	$.reset(p);
	$.append($$anchor, p);
}