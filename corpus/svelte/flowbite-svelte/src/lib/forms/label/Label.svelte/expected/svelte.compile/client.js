import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { label } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'color',
	'show',
	'class'
]);

var root = $.from_html(`<label><!></label>`);

export default function Label($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, "gray"),
		show = $.prop($$props, 'show', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("label"));
	let base = $.derived(() => label({ color: color(), class: clsx($.get(theme), $$props.class) }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var label_1 = root();

			$.attribute_effect(label_1, () => ({ ...restProps, class: $.get(base) }));

			var node_1 = $.child(label_1);

			$.snippet(node_1, () => $$props.children);
			$.reset(label_1);
			$.append($$anchor, label_1);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.snippet(node_2, () => $$props.children);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (show()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}