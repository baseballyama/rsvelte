import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toggle } from "./theme";
import clsx from "clsx";
import Label from "$lib/forms/label/Label.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'size',
	'value',
	'checked',
	'disabled',
	'color',
	'class',
	'classes',
	'inputClass',
	'spanClass',
	'offLabel'
]);

var root = $.from_html(`<!> <input/> <span></span> <!>`, 1);

export default function Toggle($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, "default"),
		checked = $.prop($$props, 'checked', 15),
		color = $.prop($$props, 'color', 3, "primary"),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("Toggle", untrack(() => ({ inputClass: $$props.inputClass, spanClass: $$props.spanClass })), { inputClass: "input", spanClass: "span" });

	const styling = $.derived(() => $$props.classes ?? { input: $$props.inputClass, span: $$props.spanClass });
	const theme = $.derived(() => getTheme("toggle"));

	const $$d = $.derived(() => toggle({
			color: color(),
			checked: checked(),
			size: size(),
			disabled: $$props.disabled,
			off_state_label: !!$$props.offLabel
		})),
		input = $.derived(() => $.get($$d).input),
		label = $.derived(() => $.get($$d).label),
		span = $.derived(() => $.get($$d).span);

	{
		let $0 = $.derived(() => $.get(label)({ class: clsx($.get(theme)?.label, $$props.class) }));

		Label($$anchor, {
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.snippet(node_1, () => $$props.offLabel);
						$.append($$anchor, fragment_2);
					};

					$.if(node, ($$render) => {
						if ($$props.offLabel) $$render(consequent);
					});
				}

				var input_1 = $.sibling(node, 2);

				$.attribute_effect(
					input_1,
					($0) => ({
						type: 'checkbox',
						value: $$props.value,
						...restProps,
						disabled: $$props.disabled,
						class: $0
					}),
					[
						() => $.get(input)({ class: clsx($.get(theme)?.input, $.get(styling).input) })
					],
					void 0,
					void 0,
					void 0,
					true
				);

				var span_1 = $.sibling(input_1, 2);
				var node_2 = $.sibling(span_1, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.snippet(node_3, () => $$props.children);
						$.append($$anchor, fragment_3);
					};

					$.if(node_2, ($$render) => {
						if ($$props.children) $$render(consequent_1);
					});
				}

				$.template_effect(($0) => $.set_class(span_1, 1, $0), [
					() => $.clsx($.get(span)({ class: clsx($.get(theme)?.span, $.get(styling).span) }))
				]);

				$.bind_checked(input_1, checked);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}