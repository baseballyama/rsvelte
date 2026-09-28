import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/buttons/Button.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import Checkbox from "./Checkbox.svelte";
import { checkboxButton } from "./theme";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'group',
	'checked',
	'inline',
	'pill',
	'outline',
	'size',
	'color',
	'shadow'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function CheckboxButton($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	let group = $.prop($$props, 'group', 15),
		checked = $.prop($$props, 'checked', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("checkboxButton"));

	let buttonClass = $.derived(() => checkboxButton({
		inline: $$props.inline,
		checked: checked(),
		class: clsx($.get(theme), $$props.class)
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
			return $.get(buttonClass);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Checkbox(node, $.spread_props(() => restProps, {
				class: 'sr-only',
				get group() {
					return group();
				},

				set group($$value) {
					group($$value);
				},

				get checked() {
					return checked();
				},

				set checked($$value) {
					checked($$value);
				}
			}));

			var node_1 = $.sibling(node, 2);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}