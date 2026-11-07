import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { radio } from "./theme";
import clsx from "clsx";
import Label from "$lib/forms/label/Label.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'aria-describedby',
	'inline',
	'labelClass',
	'color',
	'custom',
	'group',
	'value',
	'class',
	'inputClass',
	'classes'
]);

var root = $.from_html(`<input/> <!>`, 1);

export default function Radio($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// remove inputClass in next major version
	let inline = $.prop($$props, 'inline', 3, false),
		color = $.prop($$props, 'color', 3, "primary"),
		custom = $.prop($$props, 'custom', 3, false),
		group = $.prop($$props, 'group', 15),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Radio",
		untrack(() => ({
			inputClass: $$props.inputClass,
			labelClass: $$props.labelClass
		})),
		{ inputClass: "class", labelClass: "label" }
	);

	const styling = $.derived(() => $$props.classes ?? { label: $$props.labelClass });
	const theme = $.derived(() => getTheme("radio"));

	const $$d = $.derived(() => radio({
			color: color(),
			tinted: !!getContext("background"),
			custom: custom(),
			inline: inline()
		})),
		input = $.derived(() => $.get($$d).input),
		label = $.derived(() => $.get($$d).label);

	{
		let $0 = $.derived(() => $.get(label)({ class: clsx($.get(theme)?.label, $.get(styling).label) }));

		Label($$anchor, {
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var input_1 = $.first_child(fragment_1);

				$.attribute_effect(
					input_1,
					($0) => ({
						type: 'radio',
						value: $$props.value,
						'aria-describedby': $$props['aria-describedby'],
						...restProps,
						class: $0
					}),
					[
						() => $.get(input)({
							class: clsx($.get(theme)?.input, $$props.class ?? $$props.inputClass)
						})
					],
					void 0,
					void 0,
					void 0,
					true
				);

				var node = $.sibling(input_1, 2);

				$.snippet(node, () => $$props.children ?? $.noop);

				$.bind_group(
					binding_group,
					[],
					input_1,
					() => {
						$$props.value;

						return group();
					},
					group
				);

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}