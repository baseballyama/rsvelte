import * as $ from 'svelte/internal/server';
import * as constants from '$lib/constants/generator';
import { settingsBackgrounds } from '$lib/state/generator.svelte';
import chroma from 'chroma-js';

export default function ControlsBackgrounds($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let lightColorName = initialLight.name;
		let lightShade = initialLight.shade;
		let darkColorName = initialDark.name;
		let darkShade = initialDark.shade;

		$$renderer.push(`<div class="space-y-4"><p class="opacity-60">Set the body background color for either mode.</p> <div class="grid grid-cols-2 gap-4"><label class="label space-y-2"><span class="label-text">Light Mode</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"${$.attr_style('', { background: settingsBackgrounds['--color-root-bg-light'] })}></div> `);

		$$renderer.select({ class: 'select', value: lightColorName }, ($$renderer) => {
			$$renderer.option({ value: 'white' }, ($$renderer) => {
				$$renderer.push(`white`);
			});

			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(constants.colorNames);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let colorName = each_array[$$index];

				$$renderer.option({ value: colorName }, ($$renderer) => {
					$$renderer.push(`${$.escape(colorName)}`);
				});
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(` `);

		if (lightColorName !== 'white') {
			$$renderer.push('<!--[0-->');

			$$renderer.select({ class: 'select', value: lightShade }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(constants.colorShades);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let colorShade = each_array_1[$$index_1];

					$$renderer.option({ value: colorShade.toString() }, ($$renderer) => {
						$$renderer.push(`${$.escape(colorShade)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></label> <label class="label space-y-2"><span class="label-text">Dark Mode</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"${$.attr_style('', { background: settingsBackgrounds['--color-root-bg-dark'] })}></div> `);

		$$renderer.select({ class: 'select', value: darkColorName }, ($$renderer) => {
			$$renderer.option({ value: 'black' }, ($$renderer) => {
				$$renderer.push(`black`);
			});

			$$renderer.push(`<!--[-->`);

			const each_array_2 = $.ensure_array_like(constants.colorNames);

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let colorName = each_array_2[$$index_2];

				$$renderer.option({ value: colorName }, ($$renderer) => {
					$$renderer.push(`${$.escape(colorName)}`);
				});
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(` `);

		if (darkColorName !== 'black') {
			$$renderer.push('<!--[0-->');

			$$renderer.select({ class: 'select', value: darkShade }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_3 = $.ensure_array_like(constants.colorShades);

				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let colorShade = each_array_3[$$index_3];

					$$renderer.option({ value: colorShade.toString() }, ($$renderer) => {
						$$renderer.push(`${$.escape(colorShade)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></label></div></div>`);
	});
}