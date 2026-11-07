import * as $ from 'svelte/internal/server';
import { kde } from 'layerchart';
import { Code, Json } from '@layerstack/docs/components';

export default function Kde($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const values = [
			10,
			15,
			18,
			20,
			22,
			25,
			28,
			30,
			32,
			35,
			37,
			40,
			42,
			45,
			48,
			50,
			55,
			58,
			60
		];

		const result = kde(values, { thresholds: 10 });

		Code($$renderer, {
			source: `kde([10, 15, 18, 20, 22, ...], ${$.stringify({ thresholds: 10 })})`,
			language: 'js',
			class: 'mb-4'
		});

		$$renderer.push(`<!----> <div class="text-sm mb-2">Returns [value, density] pairs:</div> `);
		Json($$renderer, { value: result, class: 'rounded-sm' });
		$$renderer.push(`<!---->`);
	});
}