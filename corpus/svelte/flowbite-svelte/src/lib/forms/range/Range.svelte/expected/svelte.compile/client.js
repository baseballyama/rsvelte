import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { range } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'appearance',
	'color',
	'size',
	'inputClass',
	'class'
]);

var root = $.from_html(`<input/>`);

export default function Range($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		appearance = $.prop($$props, 'appearance', 3, "none"),
		color = $.prop($$props, 'color', 3, "blue"),
		size = $.prop($$props, 'size', 3, "md"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("range"));

	// remove inputClass in next major version
	const inputCls = $.derived(() => range({
		appearance: appearance(),
		color: color(),
		size: size(),
		class: clsx($.get(theme), $$props.inputClass, $$props.class)
	}));

	var input = root();

	$.attribute_effect(input, () => ({ type: 'range', ...restProps, class: $.get(inputCls) }), void 0, void 0, void 0, void 0, true);
	$.bind_value(input, value);
	$.append($$anchor, input);
	$.pop();
}