import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { span } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'italic',
	'underline',
	'linethrough',
	'uppercase',
	'gradient',
	'highlight',
	'decoration',
	'decorationColor',
	'decorationThickness'
]);

var root = $.from_html(`<span><!></span>`);

export default function Span($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("span"));

	let classSpan = $.derived(() => span({
		italic: $$props.italic,
		underline: $$props.underline,
		linethrough: $$props.linethrough,
		uppercase: $$props.uppercase,
		gradient: $$props.gradient,
		highlight: $$props.highlight,
		decoration: $$props.decoration,
		decorationColor: $$props.decorationColor,
		decorationThickness: $$props.decorationThickness,
		class: clsx($.get(theme), $$props.class)
	}));

	var span_1 = root();

	$.attribute_effect(span_1, () => ({ ...restProps, class: $.get(classSpan) }));

	var node = $.child(span_1);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(span_1);
	$.append($$anchor, span_1);
	$.pop();
}