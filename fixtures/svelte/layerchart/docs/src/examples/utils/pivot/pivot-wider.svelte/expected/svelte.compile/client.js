import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { pivotWider } from 'layerchart';
import { Code, Json } from '@layerstack/docs/components';
import { longData } from '$lib/utils/data';

var root = $.from_html(`<!> <div>Before</div> <!> <div>After</div> <!>`, 1);

export default function Pivot_wider($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	Code(node, {
		source: 'pivotWider(longData, \'year\', \'fruit\', \'value\')',
		language: 'js',
		class: 'mb-4'
	});

	var node_1 = $.sibling(node, 4);

	Json(node_1, {
		get value() {
			return longData;
		},
		class: 'rounded-sm'
	});

	var node_2 = $.sibling(node_1, 4);

	{
		let $0 = $.derived(() => pivotWider(longData, 'year', 'fruit', 'value'));

		Json(node_2, {
			get value() {
				return $.get($0);
			},
			class: 'rounded-sm'
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}