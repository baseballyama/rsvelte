import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import Popper from "$lib/utils/Popper.svelte";
import { getSideAxis } from "@floating-ui/utils";
import { setContext, untrack } from "svelte";
import { speedDial } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'popperClass',
	'placement',
	'pill',
	'tooltip',
	'trigger',
	'textOutside',
	'class',
	'classes',
	'isOpen'
]);

var root = $.from_html(`<div><!></div>`);

export default function SpeedDial($$anchor, $$props) {
	$.push($$props, true);

	let placement = $.prop($$props, 'placement', 3, "top"),
		pill = $.prop($$props, 'pill', 3, true),
		tooltip = $.prop($$props, 'tooltip', 3, "left"),
		trigger = $.prop($$props, 'trigger', 3, "hover"),
		textOutside = $.prop($$props, 'textOutside', 3, false),
		isOpen = $.prop($$props, 'isOpen', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("SpeedDial", untrack(() => ({ popperClass: $$props.popperClass })), { popperClass: "popper" });

	const styling = $.derived(() => $$props.classes ?? { popper: $$props.popperClass });
	const theme = $.derived(() => getTheme("speedDial"));

	const speedDialCtx = {
		get pill() {
			return pill();
		},

		get tooltip() {
			return tooltip();
		},

		get textOutside() {
			return textOutside();
		}
	};

	setContext("speed-dial", speedDialCtx);

	let vertical = $.derived(() => getSideAxis(placement()) === "y");

	let $$d = $.derived(() => speedDial({ vertical: $.get(vertical) })),
		base = $.derived(() => $.get($$d).base),
		popper = $.derived(() => $.get($$d).popper);

	{
		let $0 = $.derived(() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }));

		Popper($$anchor, $.spread_props(() => restProps, {
			get trigger() {
				return trigger();
			},
			arrow: false,
			get placement() {
				return placement();
			},

			get class() {
				return $.get($0);
			},

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

				$.template_effect(($0) => $.set_class(div, 1, $0), [
					() => $.clsx($.get(popper)({ class: clsx($.get(theme)?.popper, $.get(styling).popper) }))
				]);

				$.append($$anchor, div);
			},
			$$slots: { default: true }
		}));
	}

	$.pop();
}