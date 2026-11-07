import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { navbarLi } from "./theme";
import { getNavbarStateContext, getNavbarBreakpointContext } from "$lib/context";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'onclick',
	'activeClass',
	'nonActiveClass',
	'class'
]);

var root = $.from_html(`<button><!></button>`);
var root_1 = $.from_html(`<a><!></a>`);
var root_2 = $.from_html(`<li><!></li>`);

export default function NavLi($$anchor, $$props) {
	$.push($$props, true);

	let navState = getNavbarStateContext();
	let navBreakpointCtx = getNavbarBreakpointContext();
	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("navbarLi"));
	let active = $.derived(() => navState?.activeUrl ? $$props.href === navState.activeUrl : false);

	let liClass = $.derived(() => navbarLi({
		breakpoint: navBreakpointCtx?.value ?? "md",
		hidden: navState?.hidden ?? true,
		class: clsx(
			$.get(active)
				? $$props.activeClass ?? navState?.activeClass
				: $$props.nonActiveClass ?? navState?.nonActiveClass,
			$.get(theme),
			$$props.class
		)
	}));

	function handleClick(event) {
		// Close the mobile menu when a link is clicked
		if (navState && $$props.href !== undefined && !navState.hidden) {
			navState.hidden = true;
		}

		// Call original onclick handler if provided
		if ($$props.onclick) {
			// Cast the handler to accept a standard MouseEvent
			$$props.onclick(event);
		}
	}

	var li = root_2();
	var node = $.child(li);

	{
		var consequent = ($$anchor) => {
			var button = root();

			$.attribute_effect(button, () => ({
				role: 'presentation',
				onclick: handleClick,
				...restProps,
				class: $.get(liClass)
			}));

			var node_1 = $.child(button);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(button);
			$.append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var a = root_1();

			$.attribute_effect(a, () => ({ ...restProps, class: $.get(liClass), onclick: handleClick }));

			var node_2 = $.child(a);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(a);
			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if ($$props.href === undefined) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(li);
	$.append($$anchor, li);
	$.pop();
}