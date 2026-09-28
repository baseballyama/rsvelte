import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { buttonGroup } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";
import { setButtonGroupContext } from "$lib/context";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'size',
	'disabled',
	'class'
]);

var root = $.from_html(`<div><!></div>`);

export default function ButtonGroup($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, "md"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("buttonGroup"));
	let groupClass = $.derived(() => buttonGroup({ size: size(), class: clsx($.get(theme), $$props.class) }));

	// Create a reactive context object
	// The object itself stays the same, but its properties are reactive
	const reactiveCtx = {
		get size() {
			return size();
		},

		get disabled() {
			return $$props.disabled;
		}
	};

	setButtonGroupContext(reactiveCtx);

	var div = root();

	$.attribute_effect(div, () => ({ ...restProps, class: $.get(groupClass), role: 'group' }));

	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}