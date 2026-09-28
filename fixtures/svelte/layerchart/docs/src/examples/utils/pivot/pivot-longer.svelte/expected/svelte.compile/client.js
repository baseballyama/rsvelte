import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { pivotLonger } from 'layerchart';
import { Code, Json } from '@layerstack/docs/components';
import { wideData, longData } from '$lib/utils/data';

var root = $.from_html(`<!> <div>Before</div> <!> <div>After</div> <!>`, 1);

export default function Pivot_longer($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	Code(node, {
		source: 'pivotLonger(wideData, [\'apples\', \'bananas\', \'cherries\', \'grapes\'], \'fruit\', \'value\')',
		language: 'js',
		class: 'mb-4'
	});

	var node_1 = $.sibling(node, 4);

	Json(node_1, {
		get value() {
			return wideData;
		},
		class: 'rounded-sm'
	});

	var node_2 = $.sibling(node_1, 4);

	{
		let $0 = $.derived(() => pivotLonger(wideData, ['apples', 'bananas', 'cherries', 'grapes'], 'fruit', 'value'));

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