import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { kde } from 'layerchart';
import { Code, Json } from '@layerstack/docs/components';

var root = $.from_html(`<!> <div class="text-sm mb-2">Returns [value, density] pairs:</div> <!>`, 1);

export default function Kde($$anchor, $$props) {
	$.push($$props, true);

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
	var fragment = root();
	var node = $.first_child(fragment);

	Code(node, {
		source: `kde([10, 15, 18, 20, 22, ...], ${{ thresholds: 10 } ?? ''})`,
		language: 'js',
		class: 'mb-4'
	});

	var node_1 = $.sibling(node, 4);

	Json(node_1, {
		get value() {
			return result;
		},
		class: 'rounded-sm'
	});

	$.append($$anchor, fragment);
	$.pop();
}