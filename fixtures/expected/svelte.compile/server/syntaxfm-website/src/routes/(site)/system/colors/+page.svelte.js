import * as $ from 'svelte/internal/server';
import toast from 'svelte-french-toast';
import ColorsInJs from './colors-in-js.svelte';
import { oklchToRgba, rgbaToHex } from '$/utilities/colors';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const COLORS = ['black', 'yellow', 'teal', 'green', 'red', 'purple'];
		let type = 'HEX';

		function pick_color(index) {
			if (index >= 5) {
				return 1;
			} else if (index < 5) {
				return 8;
			}

			return Math.abs(index - 9);
		}

		function copy_color(color, currentTarget) {
			let local_color = color;

			if (type === 'OKLCH') {
				local_color = getComputedStyle(document.documentElement).getPropertyValue(`--${color}`);
			} else if (type === 'VARIABLE') {
				local_color = `var(--${color})`;
			} else if (type === 'RGBA') {
				local_color = oklchToRgba(getComputedStyle(currentTarget).backgroundColor);
			} else if (type === 'HEX') {
				let oklch = oklchToRgba(getComputedStyle(currentTarget).backgroundColor);

				local_color = rgbaToHex(oklch);
			}

			navigator.clipboard.writeText(local_color);
			toast.success(`Copied ${local_color} to clipboard`);
		}

		$$renderer.push(`<label>`);

		$$renderer.select({ value: type, name: '', id: '' }, ($$renderer) => {
			$$renderer.option({ value: 'HEX' }, ($$renderer) => {
				$$renderer.push(`HEX`);
			});

			$$renderer.option({ value: 'VARIABLE' }, ($$renderer) => {
				$$renderer.push(`Variable`);
			});

			$$renderer.option({ value: 'OKLCH' }, ($$renderer) => {
				$$renderer.push(`OKLCH`);
			});

			$$renderer.option({ value: 'RGBA' }, ($$renderer) => {
				$$renderer.push(`RGBA`);
			});
		});

		$$renderer.push(`</label> <section class="svelte-19zn03o"><!--[-->`);

		const each_array = $.ensure_array_like(COLORS);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let color = each_array[$$index_1];

			$$renderer.push(`<div class="wrapper svelte-19zn03o"><div tabindex="0" role="button" class="primary box svelte-19zn03o"${$.attr_style(`--fg_demo_box_color: var(--${color})`)}>${$.escape(color)}</div> <!--[-->`);

			const each_array_1 = $.ensure_array_like(Array(10));

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let item = each_array_1[index];

				$$renderer.push(`<div tabindex="0" role="button"${$.attr_class(`box`, 'svelte-19zn03o')}${$.attr_style(`--fg_demo_color: var(--${color}-${pick_color(index)}); --fg_demo_box_color: var(--${color}-${index + 1});`)}>${$.escape(color)}-${$.escape(index + 1)}</div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--> `);
		ColorsInJs($$renderer, {});
		$$renderer.push(`<!----></section>`);
	});
}