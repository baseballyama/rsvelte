import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { computeBoxStats } from 'layerchart';
import { Code, Json } from '@layerstack/docs/components';

var root = $.from_html(`<!> <!>`, 1);

export default function Compute_box_stats($$anchor, $$props) {
	$.push($$props, true);

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
	var fragment = root();
	var node = $.first_child(fragment);

	Code(node, {
		source: 'computeBoxStats([2, 7, 8, 12, 15, 18, 21, 25, ...])',
		language: 'js',
		class: 'mb-4'
	});

	var node_1 = $.sibling(node, 2);

	Json(node_1, {
		get value() {
			return result;
		},
		class: 'rounded-sm'
	});

	$.append($$anchor, fragment);
	$.pop();
}