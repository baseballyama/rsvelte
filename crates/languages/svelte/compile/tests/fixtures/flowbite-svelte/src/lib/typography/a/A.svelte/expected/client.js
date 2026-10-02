import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { anchor } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'color',
	'asButton',
	'onclick',
	'href',
	'class'
]);

var root = $.from_html(`<button><!></button>`);
var root_1 = $.from_html(`<a><!></a>`);

export default function A($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, "primary"),
		asButton = $.prop($$props, 'asButton', 3, false),
		href = $.prop($$props, 'href', 3, "#"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("anchor"));
	let linkCls = $.derived(() => anchor({ color: color(), class: clsx($.get(theme), $$props.class) }));

	// Handle click events when in button mode
	function handleClick(event) {
		if (asButton()) {
			event.preventDefault(); // Prevent default anchor behavior
		}

		// Forward the onclick handler if provided
		if ($$props.onclick) {
			$$props.onclick(event);
		}
	}

	let buttonProps = $.derived(() => () => {
		const { href, target, rel, download, ...filtered } = restProps;

		return filtered;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var button = root();

			$.attribute_effect(button, () => ({
				type: 'button',
				class: $.get(linkCls),
				onclick: handleClick,
				...$.get(buttonProps)
			}));

			var node_1 = $.child(button);

			$.snippet(node_1, () => $$props.children);
			$.reset(button);
			$.append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var a = root_1();

			$.attribute_effect(a, () => ({
				href: href(),
				class: $.get(linkCls),
				onclick: handleClick,
				...restProps
			}));

			var node_2 = $.child(a);

			$.snippet(node_2, () => $$props.children);
			$.reset(a);
			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if (asButton()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}