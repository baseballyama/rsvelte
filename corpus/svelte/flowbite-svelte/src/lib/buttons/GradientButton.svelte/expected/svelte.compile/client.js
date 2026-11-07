import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { gradientButton } from "./theme";
import clsx from "clsx";
import Button from "./Button.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import { getButtonGroupContext } from "$lib/context";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'outline',
	'pill',
	'color',
	'shadow',
	'class',
	'href',
	'disabled',
	'size',
	'btnClass'
]);

var root = $.from_html(`<div><!></div>`);

export default function GradientButton($$anchor, $$props) {
	$.push($$props, true);

	const group = getButtonGroupContext()?.size;

	let color = $.prop($$props, 'color', 3, "blue"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("gradientButton"));

	const $$d = $.derived(() => gradientButton({
			color: color(),
			outline: $$props.outline,
			pill: $$props.pill,
			shadow: $$props.shadow,
			disabled: $$props.disabled,
			size: $$props.size,
			group: !!group
		})),
		base = $.derived(() => $.get($$d).base),
		outlineWrapper = $.derived(() => $.get($$d).outlineWrapper);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			{
				let $0 = $.derived(() => $.get(outlineWrapper)({ class: clsx($.get(theme)?.outlineWrapper, $$props.btnClass) }));

				Button(node_1, $.spread_props(() => restProps, {
					get class() {
						return $.get($0);
					},

					get disabled() {
						return $$props.disabled;
					},

					get href() {
						return $$props.href;
					},

					get size() {
						return $$props.size;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						$.snippet(node_2, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}));
			}

			$.reset(div);

			$.template_effect(($0) => $.set_class(div, 1, $0), [
				() => $.clsx($.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }))
			]);

			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }));

				Button($$anchor, $.spread_props(() => restProps, {
					get class() {
						return $.get($0);
					},

					get disabled() {
						return $$props.disabled;
					},

					get href() {
						return $$props.href;
					},

					get size() {
						return $$props.size;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.snippet(node_3, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				}));
			}
		};

		$.if(node, ($$render) => {
			if ($$props.outline) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}