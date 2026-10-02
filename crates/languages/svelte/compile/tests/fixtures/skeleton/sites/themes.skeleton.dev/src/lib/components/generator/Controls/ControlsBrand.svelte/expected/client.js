import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as constants from '$lib/constants/generator';
import { settingsBrand } from '$lib/state/generator.svelte';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<div class="space-y-4"><p class="opacity-60">A variable accent color for your design system.</p> <div class="grid grid-cols-2 gap-4"><label class="label space-y-2"><span class="label-text">Light Mode</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"></div> <select class="select"></select> <select class="select"></select></label> <label class="label space-y-2"><span class="label-text">Dark Mode</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"></div> <select class="select"></select> <select class="select"></select></label></div></div>`);

export default function ControlsBrand($$anchor, $$props) {
	$.push($$props, true);

	// Constants
	// State
	/** Parses a `var(--color-{name}-{shade})` reference back into its parts. */
	function parseColorRef(value) {
		const match = value.match(/^var\(--color-([a-z]+)-(\d+)\)$/);

		return match
			? { name: match[1], shade: match[2] }
			: { name: 'primary', shade: '500' };
	}

	const initialLight = parseColorRef(settingsBrand['--color-brand-light']);
	const initialDark = parseColorRef(settingsBrand['--color-brand-dark']);
	let lightColorName = $.state($.proxy(initialLight.name));
	let lightShade = $.state($.proxy(initialLight.shade));
	let darkColorName = $.state($.proxy(initialDark.name));
	let darkShade = $.state($.proxy(initialDark.shade));

	// Brand isn't its own ramp — it's a reference into an existing palette color/shade.
	// Contrast is derived automatically from that same reference, not user-editable.
	$.user_effect(() => {
		settingsBrand['--color-brand-light'] = `var(--color-${$.get(lightColorName)}-${$.get(lightShade)})`;
		settingsBrand['--color-brand-contrast-light'] = `var(--color-${$.get(lightColorName)}-contrast-${$.get(lightShade)})`;
	});

	$.user_effect(() => {
		settingsBrand['--color-brand-dark'] = `var(--color-${$.get(darkColorName)}-${$.get(darkShade)})`;
		settingsBrand['--color-brand-contrast-dark'] = `var(--color-${$.get(darkColorName)}-contrast-${$.get(darkShade)})`;
	});

	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);
	var label = $.child(div_1);
	var div_2 = $.sibling($.child(label), 2);
	let styles;
	var select = $.sibling(div_2, 2);

	$.each(select, 21, () => constants.colorNames, $.index, ($$anchor, colorName) => {
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(colorName));

			if (option_value !== (option_value = $.get(colorName))) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);

	var select_1 = $.sibling(select, 2);

	$.each(select_1, 21, () => constants.colorShades, $.index, ($$anchor, colorShade) => {
		var option_1 = root();
		var text_1 = $.only_child(option_1, true);
		var option_1_value = {};

		$.template_effect(
			($0) => {
				$.set_text(text_1, $.get(colorShade));

				if (option_1_value !== (option_1_value = $0)) {
					option_1.value = (option_1.__value = option_1_value) ?? '';
				}
			},
			[() => $.get(colorShade).toString()]
		);

		$.append($$anchor, option_1);
	});

	$.reset(select_1);
	$.init_select(select_1);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var div_3 = $.sibling($.child(label_1), 2);
	let styles_1;
	var select_2 = $.sibling(div_3, 2);

	$.each(select_2, 21, () => constants.colorNames, $.index, ($$anchor, colorName) => {
		var option_2 = root();
		var text_2 = $.only_child(option_2, true);
		var option_2_value = {};

		$.template_effect(() => {
			$.set_text(text_2, $.get(colorName));

			if (option_2_value !== (option_2_value = $.get(colorName))) {
				option_2.value = (option_2.__value = option_2_value) ?? '';
			}
		});

		$.append($$anchor, option_2);
	});

	$.reset(select_2);
	$.init_select(select_2);

	var select_3 = $.sibling(select_2, 2);

	$.each(select_3, 21, () => constants.colorShades, $.index, ($$anchor, colorShade) => {
		var option_3 = root();
		var text_3 = $.only_child(option_3, true);
		var option_3_value = {};

		$.template_effect(
			($0) => {
				$.set_text(text_3, $.get(colorShade));

				if (option_3_value !== (option_3_value = $0)) {
					option_3.value = (option_3.__value = option_3_value) ?? '';
				}
			},
			[() => $.get(colorShade).toString()]
		);

		$.append($$anchor, option_3);
	});

	$.reset(select_3);
	$.init_select(select_3);
	$.reset(label_1);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		styles = $.set_style(div_2, '', styles, { background: settingsBrand['--color-brand-light'] });
		styles_1 = $.set_style(div_3, '', styles_1, { background: settingsBrand['--color-brand-dark'] });
	});

	$.bind_select_value(select, () => $.get(lightColorName), ($$value) => $.set(lightColorName, $$value));
	$.bind_select_value(select_1, () => $.get(lightShade), ($$value) => $.set(lightShade, $$value));
	$.bind_select_value(select_2, () => $.get(darkColorName), ($$value) => $.set(darkColorName, $$value));
	$.bind_select_value(select_3, () => $.get(darkShade), ($$value) => $.set(darkShade, $$value));
	$.append($$anchor, div);
	$.pop();
}