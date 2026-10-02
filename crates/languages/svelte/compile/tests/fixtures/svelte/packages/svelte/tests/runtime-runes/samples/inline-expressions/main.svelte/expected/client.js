import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Without text expression: 7.36</p> <p></p> <p></p> <p></p> <h1></h1> <p></p> <h1> </h1>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);

	p.textContent = 'With text expression: 7.36';

	var p_1 = $.sibling(p, 2);

	p_1.textContent = `With text expression and function call: ${(7.36).toString() ?? ''}`;

	var p_2 = $.sibling(p_1, 2);

	p_2.textContent = `With text expression and property access: ${("test").length ?? ''}`;

	var h1 = $.sibling(p_2, 2);

	h1.textContent = `Hello ${('name').toUpperCase().toLowerCase() ?? ''}!`;

	var p_3 = $.sibling(h1, 2);

	p_3.textContent = ("test").length;

	var h1_1 = $.sibling(p_3, 2);
	var text = $.only_child(h1_1);

	$.template_effect(($0) => $.set_text(text, `Tracking: ${$0 ?? ''}`), [() => $.effect_tracking()]);
	$.append($$anchor, fragment);
	$.pop();
}