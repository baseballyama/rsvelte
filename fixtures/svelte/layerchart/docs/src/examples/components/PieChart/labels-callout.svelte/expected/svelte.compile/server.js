import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { RangeField } from 'svelte-ux';
import { longData } from '$lib/utils/data';
import { fruitColors } from '$lib/utils/fruits';

export default function Labels_callout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let calloutLineLength = 16;
		let calloutLabelOffset = 12;
		let calloutPadding = 4;
		const data = longData.filter((d) => d.year === 2019);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-3 gap-2 mb-4">`);

			RangeField($$renderer, {
				label: 'calloutLineLength',
				min: 0,
				max: 60,
				get value() {
					return calloutLineLength;
				},

				set value($$value) {
					calloutLineLength = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'calloutLabelOffset',
				min: 0,
				max: 60,
				get value() {
					return calloutLabelOffset;
				},

				set value($$value) {
					calloutLabelOffset = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'calloutPadding',
				min: 0,
				max: 20,
				get value() {
					return calloutPadding;
				},

				set value($$value) {
					calloutPadding = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> `);

			PieChart($$renderer, {
				data,
				key: 'fruit',
				value: 'value',
				cRange: fruitColors,
				innerRadius: -40,
				padding: { top: 24, bottom: 24, left: 100, right: 100 },
				labels: {
					placement: 'callout',
					value: 'fruit',
					calloutLineLength,
					calloutLabelOffset,
					calloutPadding,
					class: 'text-xs fill-surface-content',
					line: { class: 'opacity-50' }
				},
				height: 360
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}