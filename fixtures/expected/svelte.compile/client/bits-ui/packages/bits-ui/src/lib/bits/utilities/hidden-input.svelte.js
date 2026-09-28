import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mergeProps, srOnlyStyles } from "svelte-toolbelt";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value']);
var root = $.from_html(`<input/>`);

export default function Hidden_input($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		restProps = $.rest_props($$props, rest_excludes);

	const mergedProps = $.derived(() => mergeProps(restProps, {
		"aria-hidden": "true",
		tabindex: -1,
		style: { ...srOnlyStyles, position: "absolute", top: "0", left: "0" }
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var input = root();

			$.attribute_effect(input, () => ({ ...$.get(mergedProps), value: value() }), void 0, void 0, void 0, void 0, true);
			$.append($$anchor, input);
		};

		var alternate = ($$anchor) => {
			var input_1 = root();

			$.attribute_effect(input_1, () => ({ ...$.get(mergedProps) }), void 0, void 0, void 0, void 0, true);
			$.bind_value(input_1, value);
			$.append($$anchor, input_1);
		};

		$.if(node, ($$render) => {
			if ($.get(mergedProps).type === "checkbox") $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}