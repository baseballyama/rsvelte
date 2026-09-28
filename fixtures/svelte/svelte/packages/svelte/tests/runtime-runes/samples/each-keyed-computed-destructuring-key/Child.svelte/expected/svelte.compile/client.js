import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Child($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $$props.options, ({ [$$props.labelKey]: label, [$$props.valueKey]: value }) => value, ($$anchor, $$item) => {
		let label = () => $.get($$item)[$$props.labelKey];
		let value = () => $.get($$item)[$$props.valueKey];
		var p = root();
		var text = $.only_child(p);

		$.template_effect(() => $.set_text(text, `${label() ?? ''}: ${value() ?? ''}`));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}