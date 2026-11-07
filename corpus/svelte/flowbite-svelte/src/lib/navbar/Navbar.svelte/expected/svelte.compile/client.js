import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import NavContainer from "./NavContainer.svelte";
import { navbar } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import { setNavbarStateContext, setNavbarBreakpointContext } from "$lib/context";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'fluid',
	'navContainerClass',
	'class',
	'closeOnClickOutside',
	'breakpoint'
]);

var root = $.from_html(`<nav><div><!></div></nav>`);

export default function Navbar($$anchor, $$props) {
	$.push($$props, true);

	let closeOnClickOutside = $.prop($$props, 'closeOnClickOutside', 3, true),
		breakpoint = $.prop($$props, 'breakpoint', 3, "md"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("navbar"));
	let navState = $.proxy({ hidden: true });

	setNavbarStateContext(navState);

	let breakpointState = $.proxy({ value: untrack(() => breakpoint()) });

	setNavbarBreakpointContext(breakpointState);

	$.user_effect(() => {
		breakpointState.value = breakpoint();
	});

	// Add reference to the navbar element
	let navbarElement;

	let toggle = () => {
		navState.hidden = !navState.hidden;
	};

	function handleDocumentClick(event) {
		if (!closeOnClickOutside()) return;

		// Check if the click was outside the navbar AND the dropdown is open
		if (!navState.hidden && navbarElement && !navbarElement.contains(event.target)) {
			navState.hidden = true;
		}
	}

	var nav = root();

	$.event('click', $.document, handleDocumentClick);

	var div = $.child(nav);

	$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [() => navbar({ class: clsx($.get(theme), $$props.class) })]);

	var node = $.child(div);

	{
		let $0 = $.derived(() => clsx($$props.navContainerClass));

		NavContainer(node, {
			get fluid() {
				return $$props.fluid;
			},

			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.snippet(node_1, () => $$props.children, () => ({ hidden: navState.hidden, toggle, NavContainer }));
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.reset(nav);
	$.bind_this(nav, ($$value) => navbarElement = $$value, () => navbarElement);
	$.append($$anchor, nav);
	$.pop();
}