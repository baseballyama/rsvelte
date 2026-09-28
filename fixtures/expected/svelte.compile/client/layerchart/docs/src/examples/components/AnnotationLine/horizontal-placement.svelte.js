import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationLine, LineChart } from 'layerchart';
import AnnotationLineControls from '$lib/components/controls/AnnotationRangePointLineControls.svelte';

const data = await getAppleStock();
var root = $.from_html(`<!> <!>`, 1);

export default function Horizontal_placement($$anchor, $$props) {
	$.push($$props, true);

	let placement = $.state('top-right');
	let xOffset = $.state(0);
	let yOffset = $.state(0);
	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	AnnotationLineControls(node, {
		get placement() {
			return $.get(placement);
		},

		set placement($$value) {
			$.set(placement, $$value, true);
		},

		get xOffset() {
			return $.get(xOffset);
		},

		set xOffset($$value) {
			$.set(xOffset, $$value, true);
		},

		get yOffset() {
			return $.get(yOffset);
		},

		set yOffset($$value) {
			$.set(yOffset, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			AnnotationLine($$anchor, {
				y: 500,
				get label() {
					return $.get(placement);
				},

				get labelPlacement() {
					return $.get(placement);
				},

				get labelXOffset() {
					return $.get(xOffset);
				},

				get labelYOffset() {
					return $.get(yOffset);
				},

				props: {
					line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
					label: { fill: 'var(--color-danger)' }
				}
			});
		};

		LineChart(node_1, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			padding: { top: 10, bottom: 20, left: 25 },
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}