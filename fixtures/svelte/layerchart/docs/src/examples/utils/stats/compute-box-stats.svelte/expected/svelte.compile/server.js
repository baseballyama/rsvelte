import * as $ from 'svelte/internal/server';
import { computeBoxStats } from 'layerchart';
import { Code, Json } from '@layerstack/docs/components';

export default function Compute_box_stats($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const values = [
			2,
			7,
			8,
			12,
			15,
			18,
			21,
			25,
			27,
			30,
			32,
			35,
			38,
			40,
			42,
			45,
			50,
			55,
			60,
			85
		];

		const result = computeBoxStats(values);

		Code($$renderer, {
			source: 'computeBoxStats([2, 7, 8, 12, 15, 18, 21, 25, ...])',
			language: 'js',
			class: 'mb-4'
		});

		$$renderer.push(`<!----> `);
		Json($$renderer, { value: result, class: 'rounded-sm' });
		$$renderer.push(`<!---->`);
	});
}