import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Arc, Chart, LinearGradient, Text, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="px-4 py-1 border rounded-sm"><!></div>`);
var root_2 = $.from_html(`<div class="grid grid-cols-4 gap-2 mb-2"></div>`);

export default function Label_direction($$anchor, $$props) {
	$.push($$props, true);

	let value = 60;
	let domain = $.proxy([0, 100]);
	let cornerRadius = 8;
	let outerText = 'Outer Text';
	let innerText = 'Inner Text';
	let centroidText = 'Centroid Text';

	const labelExamples = [
		{ label: 'Top CW', range: [-90, 90] },
		{ label: 'Top CCW', range: [90, -90] },
		{ label: 'Bottom CW', range: [-270, -90] },
		{ label: 'Bottom CCW', range: [-90, -270] },
		{ label: 'Left CW', range: [-180, 0] },
		{ label: 'Left CCW', range: [0, -180] },
		{ label: 'Right CW', range: [0, 180] },
		{ label: 'Right CCW', range: [180, 0] }
	];

	const data = { value, labelExamples };
	var $$exports = { data };
	var div = root_2();

	$.each(div, 21, () => labelExamples, $.index, ($$anchor, example) => {
		var div_1 = root_1();
		var node = $.child(div_1);

		Chart(node, {
			height: 300,
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					center: true,
					children: ($$anchor, $$slotProps) => {
						{
							const children = ($$anchor, $$arg0) => {
								let gradient = () => ($$arg0?.()).gradient;

								{
									const children = ($$anchor, $$arg0) => {
										let getArcTextProps = () => ($$arg0?.()).getArcTextProps;
										let getTrackTextProps = () => ($$arg0?.()).getTrackTextProps;
										var fragment_3 = root();
										var node_1 = $.first_child(fragment_3);

										Text(node_1, {
											get value() {
												return $.get(example).label;
											},
											textAnchor: 'middle',
											verticalAnchor: 'middle',
											class: 'text-xs',
											dy: -8
										});

										var node_2 = $.sibling(node_1, 2);

										{
											let $0 = $.derived(() => $.get(example).range.map((r) => r + '°').join(', '));

											Text(node_2, {
												get value() {
													return $.get($0);
												},
												textAnchor: 'middle',
												verticalAnchor: 'middle',
												class: 'text-xs',
												dy: 8
											});
										}

										var node_3 = $.sibling(node_2, 2);

										{
											let $0 = $.derived(() => getArcTextProps()('inner'));

											Text(node_3, $.spread_props(() => $.get($0), { value: innerText, fontSize: 12, truncate: true }));
										}

										var node_4 = $.sibling(node_3, 2);

										{
											let $0 = $.derived(() => getArcTextProps()('outer'));

											Text(node_4, $.spread_props(() => $.get($0), { value: outerText, fontSize: 12, truncate: true }));
										}

										var node_5 = $.sibling(node_4, 2);

										{
											let $0 = $.derived(() => getArcTextProps()('middle'));

											Text(node_5, $.spread_props(() => $.get($0), {
												value: centroidText,
												fontSize: 12,
												class: 'fill-black',
												truncate: true
											}));
										}

										$.append($$anchor, fragment_3);
									};

									Arc($$anchor, {
										value,
										get domain() {
											return domain;
										},

										get range() {
											return $.get(example).range;
										},
										cornerRadius,
										innerRadius: 0.5,
										get fill() {
											return gradient();
										},
										track: { class: 'fill-surface-content/5' },
										children,
										$$slots: { default: true }
									});
								}
							};

							LinearGradient($$anchor, {
								class: 'from-secondary to-primary',
								vertical: true,
								children,
								$$slots: { default: true }
							});
						}
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.reset(div_1);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);

	return $.pop($$exports);
}