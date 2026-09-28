import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/buttons/Button.svelte";
import Tooltip from "$lib/tooltip/Tooltip.svelte";
import { getContext, untrack } from "svelte";
import { speedDialButton } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'name',
	'color',
	'tooltip',
	'pill',
	'textOutside',
	'textClass',
	'class',
	'classes'
]);

var root = $.from_html(`<!> <span> </span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function SpeedDialButton($$anchor, $$props) {
	$.push($$props, true);

	const context = getContext("speed-dial");

	let name = $.prop($$props, 'name', 3, ""),
		color = $.prop($$props, 'color', 3, "light"),
		pill = $.prop($$props, 'pill', 19, () => context.pill),
		textOutside = $.prop($$props, 'textOutside', 19, () => context.textOutside),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("SpeedDialButton", untrack(() => ({ textClass: $$props.textClass })), { textClass: "span" });

	const styling = $.derived(() => $$props.classes ?? { span: $$props.textClass });
	let tooltip = $.derived(() => $$props.tooltip ?? context.tooltip);
	const theme = $.derived(() => getTheme("speedDialButton"));

	let $$d = $.derived(() => speedDialButton({
			textOutside: textOutside(),
			noTooltip: $.get(tooltip) === "none"
		})),
		base = $.derived(() => $.get($$d).base),
		span = $.derived(() => $.get($$d).span);

	let spanCls = $.derived(() => $.get(tooltip) === "none" || textOutside()
		? $.get(span)({ class: clsx($.get(theme)?.span, $.get(styling).span) })
		: "sr-only");

	let buttonCls = $.derived(() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }));
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, $.spread_props(
		{
			get pill() {
				return pill();
			},

			get color() {
				return color();
			}
		},
		() => restProps,
		{
			get class() {
				return $.get(buttonCls);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.snippet(node_1, () => $$props.children ?? $.noop);

				var span_1 = $.sibling(node_1, 2);
				var text = $.only_child(span_1, true);

				$.template_effect(() => {
					$.set_class(span_1, 1, $.clsx($.get(spanCls)));
					$.set_text(text, name());
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	var node_2 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Tooltip($$anchor, {
				get placement() {
					return $.get(tooltip);
				},
				type: 'dark',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, name()));
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_2, ($$render) => {
			if ($.get(tooltip) !== "none") $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}