import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div> </div> <div> </div>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	const value = $.derived(() => $$props.number ?? 0);
	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1);

	$.template_effect(
		($0) => {
			$.set_text(text, `value=${$.get(value) ?? ''}`);
			$.set_text(text_1, `eager=${$0 ?? ''}`);
		},
		[() => $.eager(() => $.get(value))]
	);

	$.append($$anchor, fragment);
	$.pop();
}