import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<pre> </pre>`);

export default function _5_advanced_component_props_input($$anchor, $$props) {
	let others = $.rest_props($$props, rest_excludes);
	var pre = root();
	var text = $.only_child(pre);

	$.template_effect(
		($0) => {
			$.set_class(pre, 1, $.clsx($$props.class));

			$.set_text(text, `
	${$0 ?? ''}
`);
		},
		[() => JSON.stringify(others)]
	);

	$.append($$anchor, pre);
}