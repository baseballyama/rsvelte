import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Line, Layer } from 'layerchart';
import StartEndControls from '$lib/components/controls/MarkerControls2.svelte';

var root = $.from_html(`<div> </div> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="grid gap-2"></div>`, 1);

export default function Line_1($$anchor, $$props) {
	$.push($$props, true);

	let pathGenerator = (x) => x;
	let pointCount = 10;
	let markerStart = $.state(true);
	let markerMid = false;
	let markerEnd = $.state(true);

	const data = $.derived(() => Array.from({ length: pointCount }).map((_, i) => {
		return { x: i + 1, y: pathGenerator(i / pointCount) ?? i };
	}));

	const markerTypes = [
		'arrow',
		'triangle',
		'dot',
		'circle',
		'circle-stroke',
		'line',
		'square',
		'square-stroke'
	];

	var $$exports = {
		get data() {
			return $.get(data);
		}
	};

	var fragment = root_1();
	var node = $.first_child(fragment);

	StartEndControls(node, {
		get markerStart() {
			return $.get(markerStart);
		},

		set markerStart($$value) {
			$.set(markerStart, $$value, true);
		},

		get markerEnd() {
			return $.get(markerEnd);
		},

		set markerEnd($$value) {
			$.set(markerEnd, $$value, true);
		}
	});

	var div = $.sibling(node, 2);

	$.each(div, 21, () => markerTypes, $.index, ($$anchor, marker) => {
		var fragment_1 = root();
		var div_1 = $.first_child(fragment_1);
		var text = $.only_child(div_1, true);
		var node_1 = $.sibling(div_1, 2);

		{
			const children = ($$anchor, $$arg0) => {
				let context = () => ($$arg0?.()).context;

				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => $.get(markerStart) ? $.get(marker) : undefined);
							let $1 = $.derived(() => markerMid ? $.get(marker) : undefined);
							let $2 = $.derived(() => $.get(markerEnd) ? $.get(marker) : undefined);

							Line($$anchor, {
								x1: 0,
								get x2() {
									return context().width;
								},
								y1: 0,
								y2: 0,
								class: 'stroke-primary',
								get markerStart() {
									return $.get($0);
								},

								get markerMid() {
									return $.get($1);
								},

								get markerEnd() {
									return $.get($2);
								}
							});
						}
					},
					$$slots: { default: true }
				});
			};

			Chart(node_1, {
				get data() {
					return $.get(data);
				},
				x: 'x',
				y: 'y',
				height: 35,
				children,
				$$slots: { default: true }
			});
		}

		$.template_effect(() => $.set_text(text, $.get(marker)));
		$.append($$anchor, fragment_1);
	});

	$.reset(div);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}