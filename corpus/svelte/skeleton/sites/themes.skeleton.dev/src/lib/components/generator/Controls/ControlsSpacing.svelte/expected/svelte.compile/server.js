import * as $ from 'svelte/internal/server';
import { settingsSpacing } from '$lib/state/generator.svelte';

export default function ControlsSpacing($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const options = [
			{ label: 'Tight', size: '0.22rem' },
			{ label: 'Base', size: '0.25rem' },
			{ label: 'Loose', size: '0.28rem' }
		];

		function set(newValue) {
			settingsSpacing['--spacing'] = newValue;
		}

		function activeClass(size) {
			return settingsSpacing['--spacing'] === size ? 'preset-filled' : 'preset-tonal';
		}

		$$renderer.push(`<div class="space-y-4"><p class="opacity-60">Set the scale factor for <a href="https://tailwindcss.com/docs/customizing-spacing" target="_blank" class="text-inherit underline">Tailwind Spacing</a> utilities.</p> <label class="label"><span class="label-text">Scale Factor</span> <div class="grid grid-cols-3 gap-4"><!--[-->`);

		const each_array = $.ensure_array_like(options);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let o = each_array[$$index];

			$$renderer.push(`<button type="button"${$.attr_class(`btn ${$.stringify(activeClass(o.size))}`)}>${$.escape(o.label)}</button>`);
		}

		$$renderer.push(`<!--]--></div></label></div>`);
	});
}