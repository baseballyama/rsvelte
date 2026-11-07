import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { checkbox } from "./theme";
import clsx from "clsx";
import Label from "$lib/forms/label/Label.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'color',
	'custom',
	'inline',
	'tinted',
	'rounded',
	'group',
	'choices',
	'checked',
	'classes',
	'class',
	'divClass',
	'disabled',
	'value',
	'labelProps'
]);

var root = $.from_html(`<input/> <!>`, 1);

export default function Checkbox($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	let color = $.prop($$props, 'color', 3, "primary"),
		group = $.prop($$props, 'group', 31, () => $.proxy([])),
		choices = $.prop($$props, 'choices', 19, () => []),
		checked = $.prop($$props, 'checked', 15, false),
		labelProps = $.prop($$props, 'labelProps', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("Checkbox", untrack(() => ({ divClass: $$props.divClass })), { divClass: "div" });

	const styling = $.derived(() => $$props.classes ?? { div: $$props.divClass });
	const theme = $.derived(() => getTheme("checkbox"));

	const $$d = $.derived(() => checkbox({
			color: color(),
			tinted: $$props.tinted,
			custom: $$props.custom,
			rounded: $$props.rounded,
			inline: $$props.inline,
			disabled: $$props.disabled ?? false
		})),
		base = $.derived(() => $.get($$d).base),
		divStyle = $.derived(() => $.get($$d).div);

	$.user_effect(() => {
		if ($$props.value !== undefined && Array.isArray(group())) {
			checked(group().includes($$props.value));
		}
	});

	$.user_effect(() => {
		if ($$props.value === undefined || !Array.isArray(group())) return;

		// There's a bug in Svelte and bind:group is not working with wrapped checkbox
		// This workaround is taken from:
		// https://svelte.dev/repl/de117399559f4e7e9e14e2fc9ab243cc?version=3.12.1
		const index = group().indexOf($$props.value);

		if (checked() === undefined) checked(index >= 0);

		if (checked()) {
			if (index < 0) {
				group().push($$props.value);
			}
		} else {
			if (index >= 0) {
				group().splice(index, 1);
			}
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 19, choices, (choice, i) => choice.value ?? i, ($$anchor, choice) => {
				{
					let $0 = $.derived(() => !!$$props.children || !!$.get(choice).label);
					let $1 = $.derived(() => $.get(divStyle)({ class: clsx($.get(theme)?.div, $.get(styling).div) }));

					Label($$anchor, $.spread_props(
						{
							get show() {
								return $.get($0);
							}
						},
						labelProps,
						{
							get class() {
								return $.get($1);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var input = $.first_child(fragment_3);

								$.attribute_effect(
									input,
									($0) => ({
										type: 'checkbox',
										value: $.get(choice).value,
										checked: $.get(choice).checked ?? false,
										disabled: $$props.disabled,
										...restProps,
										class: $0
									}),
									[
										() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
									],
									void 0,
									void 0,
									void 0,
									true
								);

								var node_2 = $.sibling(input, 2);

								{
									var consequent = ($$anchor) => {
										var fragment_4 = $.comment();
										var node_3 = $.first_child(fragment_4);

										$.snippet(node_3, () => $$props.children, () => ({
											value: $.get(choice).value,
											checked: $.get(choice).checked,
											disabled: $$props.disabled
										}));

										$.append($$anchor, fragment_4);
									};

									var alternate = ($$anchor) => {
										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(choice).label));
										$.append($$anchor, text);
									};

									$.if(node_2, ($$render) => {
										if ($$props.children) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.bind_group(
									binding_group,
									[],
									input,
									() => {
										$.get(choice).value;

										return group();
									},
									group
								);

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						}
					));
				}
			});

			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			{
				let $0 = $.derived(() => !!$$props.children);
				let $1 = $.derived(() => $.get(divStyle)({ class: clsx($.get(theme)?.div, $.get(styling).div) }));

				Label($$anchor, $.spread_props(
					{
						get show() {
							return $.get($0);
						}
					},
					labelProps,
					{
						get class() {
							return $.get($1);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var input_1 = $.first_child(fragment_7);

							$.attribute_effect(
								input_1,
								($0) => ({
									type: 'checkbox',
									value: $$props.value,
									disabled: $$props.disabled,
									...restProps,
									class: $0
								}),
								[
									() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
								],
								void 0,
								void 0,
								void 0,
								true
							);

							var node_4 = $.sibling(input_1, 2);

							{
								var consequent_2 = ($$anchor) => {
									var fragment_8 = $.comment();
									var node_5 = $.first_child(fragment_8);

									$.snippet(node_5, () => $$props.children, () => ({
										value: $$props.value,
										checked: checked(),
										disabled: $$props.disabled
									}));

									$.append($$anchor, fragment_8);
								};

								$.if(node_4, ($$render) => {
									if ($$props.children) $$render(consequent_2);
								});
							}

							$.bind_checked(input_1, checked);
							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					}
				));
			}
		};

		$.if(node, ($$render) => {
			if (choices().length > 0) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}