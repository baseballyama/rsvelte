import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Arc, Chart, LinearGradient, Text, Layer } from 'layerchart';
import ArcPlaygroundControls from '$lib/components/controls/ArcPlaygroundControls.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Playground($$anchor) {
	let config = $.state($.proxy({
		show: false,
		value: 60,
		spring: true,
		domain: [0, 100],
		range: [-90, 90],
		innerRadius: 70,
		outerRadius: 140,
		cornerRadius: 8,
		padAngle: 0,
		outerText: 'Outer Text',
		innerText: 'Inner Text',
		centroidText: 'Centroid Text',
		textSize: 16
	}));

	var fragment = root_1();
	var node = $.first_child(fragment);

	ArcPlaygroundControls(node, {
		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Chart(node_1, {
		height: 350,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.key(node_3, () => $.get(config).spring, ($$anchor) => {
								{
									const children = ($$anchor, $$arg0) => {
										let gradient = () => ($$arg0?.()).gradient;

										{
											const children = ($$anchor, $$arg0) => {
												let value = () => ($$arg0?.()).value;
												let getArcTextProps = () => ($$arg0?.()).getArcTextProps;
												var fragment_6 = root();
												var node_4 = $.first_child(fragment_6);

												{
													let $0 = $.derived(() => Math.round(value()));

													Text(node_4, {
														get value() {
															return $.get($0);
														},
														textAnchor: 'middle',
														verticalAnchor: 'middle',
														class: 'text-4xl',
														dy: 8
													});
												}

												var node_5 = $.sibling(node_4, 2);

												{
													let $0 = $.derived(() => getArcTextProps()('inner'));

													Text(node_5, $.spread_props(() => $.get($0), {
														get value() {
															return $.get(config).innerText;
														},

														get fontSize() {
															return $.get(config).textSize;
														},
														truncate: true
													}));
												}

												var node_6 = $.sibling(node_5, 2);

												{
													let $0 = $.derived(() => getArcTextProps()('outer'));

													Text(node_6, $.spread_props(() => $.get($0), {
														get value() {
															return $.get(config).outerText;
														},

														get fontSize() {
															return $.get(config).textSize;
														},
														truncate: true
													}));
												}

												var node_7 = $.sibling(node_6, 2);

												{
													let $0 = $.derived(() => getArcTextProps()('middle'));

													Text(node_7, $.spread_props(() => $.get($0), {
														get value() {
															return $.get(config).centroidText;
														},

														get fontSize() {
															return $.get(config).textSize;
														},
														class: 'fill-black',
														truncate: true
													}));
												}

												$.append($$anchor, fragment_6);
											};

											let $0 = $.derived(() => $.get(config).spring ? 'spring' : undefined);

											Arc($$anchor, {
												get value() {
													return $.get(config).value;
												},

												get domain() {
													return $.get(config).domain;
												},

												get range() {
													return $.get(config).range;
												},

												get innerRadius() {
													return $.get(config).innerRadius;
												},

												get outerRadius() {
													return $.get(config).outerRadius;
												},

												get cornerRadius() {
													return $.get(config).cornerRadius;
												},

												get padAngle() {
													return $.get(config).padAngle;
												},

												get motion() {
													return $.get($0);
												},

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
							});

							$.append($$anchor, fragment_3);
						};

						$.if(node_2, ($$render) => {
							if ($.get(config).show) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}