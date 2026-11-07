import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationRange, LineChart, defaultChartPadding } from 'layerchart';
import AnnotationRangeControls from '$lib/components/controls/AnnotationRangePointLineControls.svelte';

const data = await getAppleStock();
var root = $.from_html(`<!> <!>`, 1);

export default function Label_placement($$anchor, $$props) {
	$.push($$props, true);

	const placementOptions = [
		'top-left',
		'top',
		'top-right',
		'left',
		'center',
		'right',
		'bottom-left',
		'bottom',
		'bottom-right'
	];

	let placement = $.state('center');
	let xOffset = $.state(0);
	let yOffset = $.state(0);
	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	AnnotationRangeControls(node, {
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

			AnnotationRange($$anchor, {
				x: [new Date('2010-01-01'), new Date('2010-12-31')],
				pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } },
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
				}
			});
		};

		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 15 }));

		LineChart(node_1, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			get padding() {
				return $.get($0);
			},
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}