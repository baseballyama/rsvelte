import * as $ from 'svelte/internal/server';
import { pivotWider } from 'layerchart';
import { Code, Json } from '@layerstack/docs/components';
import { longData } from '$lib/utils/data';

export default function Pivot_wider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Code($$renderer, {
			source: 'pivotWider(longData, \'year\', \'fruit\', \'value\')',
			language: 'js',
			class: 'mb-4'
		});

		$$renderer.push(`<!----> <div>Before</div> `);
		Json($$renderer, { value: longData, class: 'rounded-sm' });
		$$renderer.push(`<!----> <div>After</div> `);

		Json($$renderer, {
			value: pivotWider(longData, 'year', 'fruit', 'value'),
			class: 'rounded-sm'
		});

		$$renderer.push(`<!---->`);
	});
}