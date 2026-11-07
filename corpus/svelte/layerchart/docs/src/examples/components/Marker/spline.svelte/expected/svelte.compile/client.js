import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Spline, Layer } from 'layerchart';
import MarkerControls from '$lib/components/controls/MarkerControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

var root = $.from_html(`<div> </div> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="grid gap-2"></div>`, 1);

export default function Spline_1($$anchor, $$props) {
	$.push($$props, true);

	let config = $.state($.proxy({
		show: true,
		markerStart: true,
		markerEnd: true,
		tweened: true,
		pathGenerator: (x) => x,
		curve: undefined,
		pointCount: 10,
		amplitude: 1,
		frequency: 10,
		phase: 0
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

	const motion = $.derived(() => $.get(config).tweened ? 'tween' : 'none');

	const data = $.derived(() => Array.from({ length: $.get(config).pointCount }).map((_, i) => {
		return {
			x: i + 1,
			y: $.get(config).pathGenerator(i / $.get(config).pointCount) ?? i
		};
	}));

	var $$exports = {
		get data() {
			return $.get(data);
		}
	};

	var fragment = root_1();
	var node = $.first_child(fragment);

	MarkerControls(node, {
		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var div = $.sibling(node, 2);

	$.each(div, 21, () => markerTypes, $.index, ($$anchor, marker) => {
		var fragment_1 = root();
		var div_1 = $.first_child(fragment_1);
		var text = $.only_child(div_1, true);
		var node_1 = $.sibling(div_1, 2);

		Chart(node_1, {
			get data() {
				return $.get(data);
			},
			x: 'x',
			y: 'y',
			height: 100,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_2 = $.first_child(fragment_3);

						{
							var consequent = ($$anchor) => {
								{
									let $0 = $.derived(() => $.get(config).markerStart ? $.get(marker) : undefined);
									let $1 = $.derived(() => $.get(config).markerEnd ? $.get(marker) : undefined);

									Spline($$anchor, {
										get curve() {
											return $.get(config).curve;
										},
										class: 'stroke-primary',
										get markerStart() {
											return $.get($0);
										},

										get markerEnd() {
											return $.get($1);
										},

										get motion() {
											return $.get(motion);
										}
									});
								}
							};

							$.if(node_2, ($$render) => {
								if ($.get(config).show) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.template_effect(() => $.set_text(text, $.get(marker)));
		$.append($$anchor, fragment_1);
	});

	$.reset(div);
	$.append($$anchor, fragment);

	return $.pop($$exports);
}