import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as constants from '$lib/constants/generator';
import { settingsBackgrounds } from '$lib/state/generator.svelte';
import chroma from 'chroma-js';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<select class="select"></select>`);
var root_2 = $.from_html(`<div class="space-y-4"><p class="opacity-60">Set the body background color for either mode.</p> <div class="grid grid-cols-2 gap-4"><label class="label space-y-2"><span class="label-text">Light Mode</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"></div> <select class="select"><option>white</option><!></select> <!></label> <label class="label space-y-2"><span class="label-text">Dark Mode</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"></div> <select class="select"><option>black</option><!></select> <!></label></div></div>`);

export default function ControlsBackgrounds($$anchor, $$props) {
	$.push($$props, true);

	// Constants
	// State
	const WHITE = 'oklch(1 0 0 / 1)';

	const BLACK = 'oklch(0 0 0 / 1)';

	/**
	 * Parses a `var(--color-{name}-{shade})` reference back into its parts, or detects a literal
	 * pure white/black (imported themes may carry these as hex/oklch rather than a palette var).
	 */
	function parseColorRef(value, specialHex, specialName, fallbackShade) {
		if (chroma.valid(value) && chroma(value).hex() === specialHex) return { name: specialName, shade: fallbackShade };

		const match = value.match(/^var\(--color-([a-z]+)-(\d+)\)$/);

		return match
			? { name: match[1], shade: match[2] }
			: { name: 'surface', shade: fallbackShade };
	}

	const initialLight = parseColorRef(settingsBackgrounds['--color-root-bg-light'], '#ffffff', 'white', '50');
	const initialDark = parseColorRef(settingsBackgrounds['--color-root-bg-dark'], '#000000', 'black', '950');
	let lightColorName = $.state($.proxy(initialLight.name));
	let lightShade = $.state($.proxy(initialLight.shade));
	let darkColorName = $.state($.proxy(initialDark.name));
	let darkShade = $.state($.proxy(initialDark.shade));

	$.user_effect(() => {
		settingsBackgrounds['--color-root-bg-light'] = $.get(lightColorName) === 'white'
			? WHITE
			: `var(--color-${$.get(lightColorName)}-${$.get(lightShade)})`;
	});

	$.user_effect(() => {
		settingsBackgrounds['--color-root-bg-dark'] = $.get(darkColorName) === 'black'
			? BLACK
			: `var(--color-${$.get(darkColorName)}-${$.get(darkShade)})`;
	});

	var div = root_2();
	var div_1 = $.sibling($.child(div), 2);
	var label = $.child(div_1);
	var div_2 = $.sibling($.child(label), 2);
	let styles;
	var select = $.sibling(div_2, 2);
	var option = $.child(select);

	option.value = option.__value = 'white';

	var node = $.sibling(option);

	$.each(node, 17, () => constants.colorNames, $.index, ($$anchor, colorName) => {
		var option_1 = root();
		var text = $.only_child(option_1, true);
		var option_1_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(colorName));

			if (option_1_value !== (option_1_value = $.get(colorName))) {
				option_1.value = (option_1.__value = option_1_value) ?? '';
			}
		});

		$.append($$anchor, option_1);
	});

	$.reset(select);
	$.init_select(select);

	var node_1 = $.sibling(select, 2);

	{
		var consequent = ($$anchor) => {
			var select_1 = root_1();

			$.each(select_1, 21, () => constants.colorShades, $.index, ($$anchor, colorShade) => {
				var option_2 = root();
				var text_1 = $.only_child(option_2, true);
				var option_2_value = {};

				$.template_effect(
					($0) => {
						$.set_text(text_1, $.get(colorShade));

						if (option_2_value !== (option_2_value = $0)) {
							option_2.value = (option_2.__value = option_2_value) ?? '';
						}
					},
					[() => $.get(colorShade).toString()]
				);

				$.append($$anchor, option_2);
			});

			$.reset(select_1);
			$.init_select(select_1);
			$.bind_select_value(select_1, () => $.get(lightShade), ($$value) => $.set(lightShade, $$value));
			$.append($$anchor, select_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(lightColorName) !== 'white') $$render(consequent);
		});
	}

	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var div_3 = $.sibling($.child(label_1), 2);
	let styles_1;
	var select_2 = $.sibling(div_3, 2);
	var option_3 = $.child(select_2);

	option_3.value = option_3.__value = 'black';

	var node_2 = $.sibling(option_3);

	$.each(node_2, 17, () => constants.colorNames, $.index, ($$anchor, colorName) => {
		var option_4 = root();
		var text_2 = $.only_child(option_4, true);
		var option_4_value = {};

		$.template_effect(() => {
			$.set_text(text_2, $.get(colorName));

			if (option_4_value !== (option_4_value = $.get(colorName))) {
				option_4.value = (option_4.__value = option_4_value) ?? '';
			}
		});

		$.append($$anchor, option_4);
	});

	$.reset(select_2);
	$.init_select(select_2);

	var node_3 = $.sibling(select_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var select_3 = root_1();

			$.each(select_3, 21, () => constants.colorShades, $.index, ($$anchor, colorShade) => {
				var option_5 = root();
				var text_3 = $.only_child(option_5, true);
				var option_5_value = {};

				$.template_effect(
					($0) => {
						$.set_text(text_3, $.get(colorShade));

						if (option_5_value !== (option_5_value = $0)) {
							option_5.value = (option_5.__value = option_5_value) ?? '';
						}
					},
					[() => $.get(colorShade).toString()]
				);

				$.append($$anchor, option_5);
			});

			$.reset(select_3);
			$.init_select(select_3);
			$.bind_select_value(select_3, () => $.get(darkShade), ($$value) => $.set(darkShade, $$value));
			$.append($$anchor, select_3);
		};

		$.if(node_3, ($$render) => {
			if ($.get(darkColorName) !== 'black') $$render(consequent_1);
		});
	}

	$.reset(label_1);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		styles = $.set_style(div_2, '', styles, { background: settingsBackgrounds['--color-root-bg-light'] });
		styles_1 = $.set_style(div_3, '', styles_1, { background: settingsBackgrounds['--color-root-bg-dark'] });
	});

	$.bind_select_value(select, () => $.get(lightColorName), ($$value) => $.set(lightColorName, $$value));
	$.bind_select_value(select_2, () => $.get(darkColorName), ($$value) => $.set(darkColorName, $$value));
	$.append($$anchor, div);
	$.pop();
}