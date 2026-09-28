import * as $ from 'svelte/internal/server';
import { ArcChart } from 'layerchart';
import ShowField from '$lib/components/controls/fields/ShowField.svelte';

export default function Series_motion_spring($$renderer, $$props) {
	const data = [
		{ key: 'move', value: 400, maxValue: 1000, color: '#ef4444' },
		{ key: 'exercise', value: 20, maxValue: 30, color: '#a3e635' },
		{ key: 'stand', value: 10, maxValue: 12, color: '#22d3ee' }
	];

	let show = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ShowField($$renderer, {
			label: 'Show Arcs',
			get show() {
				return show;
			},

			set show($$value) {
				show = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div${$.attr_style('', { height: '180px' })}>`);

		if (show) {
			$$renderer.push('<!--[0-->');

			ArcChart($$renderer, {
				key: 'key',
				value: 'value',
				series: data.map((d) => {
					return { key: d.key, data: [d], maxValue: d.maxValue, color: d.color };
				}),
				props: { arc: { motion: 'spring' } },
				outerRadius: -25,
				innerRadius: -20,
				cornerRadius: 10,
				height: 180
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
	$.bind_props($$props, { data });
}