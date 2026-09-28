import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import Button from "$lib/buttons/Button.svelte";
import { radioButton } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'group',
	'value',
	'inline',
	'pill',
	'outline',
	'size',
	'color',
	'shadow',
	'checkedClass',
	'class'
]);

var root = $.from_html(`<input/> <!>`, 1);

export default function RadioButton($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	let group = $.prop($$props, 'group', 15),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("radioButton"));
	let isChecked = $.derived(() => $$props.value == group());

	let base = $.derived(() => radioButton({
		inline: $$props.inline,
		class: clsx($.get(isChecked) && $$props.checkedClass, $.get(theme), $$props.class)
	}));

	Button($$anchor, {
		tag: 'label',
		get pill() {
			return $$props.pill;
		},

		get outline() {
			return $$props.outline;
		},

		get size() {
			return $$props.size;
		},

		get color() {
			return $$props.color;
		},

		get shadow() {
			return $$props.shadow;
		},

		get class() {
			return $.get(base);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var input = $.first_child(fragment_1);

			$.attribute_effect(
				input,
				() => ({
					type: 'radio',
					class: 'sr-only',
					value: $$props.value,
					...restProps
				}),
				void 0,
				void 0,
				void 0,
				void 0,
				true
			);

			var node = $.sibling(input, 2);

			$.snippet(node, () => $$props.children ?? $.noop);

			$.bind_group(
				binding_group,
				[],
				input,
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

	$.pop();
}