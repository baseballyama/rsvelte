import * as $ from 'svelte/internal/server';
import { scaleOrdinal } from 'd3-scale';
import { schemeSpectral } from 'd3-scale-chromatic';
import { Legend } from 'layerchart';

export default function Children_override($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function children($$renderer, { scale, values }) {
				$$renderer.push(`<div class="flex gap-4"><!--[-->`);

				const each_array = $.ensure_array_like(values);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let value = each_array[$$index];

					$$renderer.push(`<div class="flex gap-1"><div class="h-4 w-4 rounded-full"${$.attr_style('', { 'background-color': scale?.(value) })}></div> <div class="text-xs text-surface-content/50">${$.escape(value)}</div></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			Legend($$renderer, {
				scale: scaleOrdinal(
					[
						'<10',
						'10-19',
						'20-29',
						'30-39',
						'40-49',
						'50-59',
						'60-69',
						'70-79',
						'≥80'
					],
					schemeSpectral[10]
				),
				title: 'Age (years)',
				children,
				$$slots: { default: true }
			});
		}
	});
}