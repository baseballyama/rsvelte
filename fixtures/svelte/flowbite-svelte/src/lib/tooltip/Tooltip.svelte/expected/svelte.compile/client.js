import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import Popper from "../utils/Popper.svelte";
import { tooltip } from "./theme";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'type',
	'color',
	'trigger',
	'arrow',
	'children',
	'placement',
	'onbeforetoggle',
	'class',
	'isOpen'
]);

var root = $.from_html(`<div class="pointer-events-none"><!></div>`);

export default function Tooltip($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, "dark"),
		color = $.prop($$props, 'color', 3, undefined),
		trigger = $.prop($$props, 'trigger', 3, "hover"),
		arrow = $.prop($$props, 'arrow', 3, true),
		placement = $.prop($$props, 'placement', 3, "top"),
		isOpen = $.prop($$props, 'isOpen', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	const base = $.derived(() => tooltip({ color: color(), type: type(), class: clsx($$props.class) }));

	function onbeforetoggle(ev) {
		// block all focusable elements inside the tooltip
		if (ev.target instanceof HTMLElement) {
			ev.target.querySelectorAll('a, button, input, textarea, select, details, [tabindex], [contenteditable="true"]').forEach((element) => element.setAttribute("tabindex", "-1"));
		}

		// bubble event to parent
		$$props.onbeforetoggle?.(ev);
	}

	Popper($$anchor, $.spread_props(() => restProps, {
		get placement() {
			return placement();
		},

		get trigger() {
			return trigger();
		},

		get arrow() {
			return arrow();
		},

		get class() {
			return $.get(base);
		},
		onbeforetoggle,
		get isOpen() {
			return isOpen();
		},

		set isOpen($$value) {
			isOpen($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			$.snippet(node, () => $$props.children);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	}));

	$.pop();
}