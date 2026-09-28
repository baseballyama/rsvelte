import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { indicator } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'color',
	'cornerStyle',
	'size',
	'border',
	'placement',
	'offset',
	'class'
]);

var root = $.from_html(`<div><!></div>`);

export default function Indicator($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, "primary"),
		cornerStyle = $.prop($$props, 'cornerStyle', 3, "circular"),
		size = $.prop($$props, 'size', 3, "md"),
		border = $.prop($$props, 'border', 3, false),
		offset = $.prop($$props, 'offset', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("indicator"));
	let hasChildren = $.derived(() => !!$$props.children);

	const base = $.derived(() => indicator({
		color: color(),
		size: size(),
		cornerStyle: cornerStyle(),
		border: border(),
		placement: $$props.placement,
		offset: offset(),
		hasChildren: $.get(hasChildren),
		class: clsx($.get(theme), $$props.class)
	}));

	var div = root();

	$.attribute_effect(div, () => ({ ...restProps, class: $.get(base) }));

	var node = $.child(div);

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

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}