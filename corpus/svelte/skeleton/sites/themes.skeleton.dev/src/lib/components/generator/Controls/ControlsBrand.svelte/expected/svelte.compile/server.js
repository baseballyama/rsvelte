import * as $ from 'svelte/internal/server';
import * as constants from '$lib/constants/generator';
import { settingsBrand } from '$lib/state/generator.svelte';

export default function ControlsBrand($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let lightColorName = initialLight.name;
		let lightShade = initialLight.shade;
		let darkColorName = initialDark.name;
		let darkShade = initialDark.shade;

		$$renderer.push(`<div class="space-y-4"><p class="opacity-60">A variable accent color for your design system.</p> <div class="grid grid-cols-2 gap-4"><label class="label space-y-2"><span class="label-text">Light Mode</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"${$.attr_style('', {
			background: // Brand isn't its own ramp — it's a reference into an existing palette color/shade.
			// Contrast is derived automatically from that same reference, not user-editable.
			settingsBrand['--color-brand-light']
		})}></div> `);

		$$renderer.select({ class: 'select', value: lightColorName }, ($$renderer) => {
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

		$$renderer.push(`</label> <label class="label space-y-2"><span class="label-text">Dark Mode</span> <div class="w-full h-4 border border-surface-200-800 rounded-base"${$.attr_style('', { background: settingsBrand['--color-brand-dark'] })}></div> `);

		$$renderer.select({ class: 'select', value: darkColorName }, ($$renderer) => {
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

		$$renderer.push(`</label></div></div>`);
	});
}