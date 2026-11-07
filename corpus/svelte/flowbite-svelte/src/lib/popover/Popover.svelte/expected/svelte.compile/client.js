import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import Popper from "../utils/Popper.svelte";
import { popover } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'title',
	'color',
	'trigger',
	'defaultClass',
	'arrow',
	'children',
	'placement',
	'class',
	'classes',
	'isOpen'
]);

var root = $.from_html(`<div><h3> </h3></div>`);
var root_1 = $.from_html(`<!> <div><!></div>`, 1);

export default function Popover($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, "default"),
		trigger = $.prop($$props, 'trigger', 3, "hover"),
		arrow = $.prop($$props, 'arrow', 3, true),
		placement = $.prop($$props, 'placement', 3, "top"),
		isOpen = $.prop($$props, 'isOpen', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("Popover", untrack(() => ({ defaultClass: $$props.defaultClass })), { defaultClass: "content" });

	const styling = $.derived(() => $$props.classes ?? { content: $$props.defaultClass });
	const theme = $.derived(() => getTheme("popover"));

	let $$d = $.derived(() => popover({ color: color() })),
		base = $.derived(() => $.get($$d).base),
		title = $.derived(() => $.get($$d).title),
		h3 = $.derived(() => $.get($$d).h3),
		content = $.derived(() => $.get($$d).content);

	{
		let $0 = $.derived(() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }));

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
				return $.get($0);
			},

			get isOpen() {
				return isOpen();
			},

			set isOpen($$value) {
				isOpen($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var div = root();
						var h3_1 = $.child(div);
						var text = $.only_child(h3_1, true);

						$.reset(div);

						$.template_effect(
							($0, $1) => {
								$.set_class(div, 1, $0);
								$.set_class(h3_1, 1, $1);
								$.set_text(text, $$props.title);
							},
							[
								() => $.clsx($.get(title)({ class: clsx($.get(theme)?.title, $$props.classes?.title) })),
								() => $.clsx($.get(h3)({ class: clsx($.get(theme)?.h3, $$props.classes?.h3) }))
							]
						);

						$.append($$anchor, div);
					};

					var consequent_1 = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.snippet(node_1, () => $$props.title);
						$.append($$anchor, fragment_2);
					};

					$.if(node, ($$render) => {
						if (typeof $$props.title === "string") $$render(consequent); else if ($$props.title) $$render(consequent_1, 1);
					});
				}

				var div_1 = $.sibling(node, 2);
				var node_2 = $.child(div_1);

				$.snippet(node_2, () => $$props.children);
				$.reset(div_1);

				$.template_effect(($0) => $.set_class(div_1, 1, $0), [
					() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $.get(styling).content) }))
				]);

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	}

	$.pop();
}