import * as $ from 'svelte/internal/server';
import { pivotLonger } from 'layerchart';
import { Code, Json } from '@layerstack/docs/components';
import { wideData, longData } from '$lib/utils/data';

export default function Pivot_longer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Code($$renderer, {
			source: 'pivotLonger(wideData, [\'apples\', \'bananas\', \'cherries\', \'grapes\'], \'fruit\', \'value\')',
			language: 'js',
			class: 'mb-4'
		});

		$$renderer.push(`<!----> <div>Before</div> `);
		Json($$renderer, { value: wideData, class: 'rounded-sm' });
		$$renderer.push(`<!----> <div>After</div> `);

		Json($$renderer, {
			value: pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'grapes'], 'fruit', 'value'),
			class: 'rounded-sm'
		});

		$$renderer.push(`<!---->`);
	});
}