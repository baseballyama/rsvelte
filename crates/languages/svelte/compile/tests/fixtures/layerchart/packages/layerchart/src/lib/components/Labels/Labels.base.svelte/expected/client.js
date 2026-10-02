import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { LabelsState } from './Labels.shared.svelte.js';
import { getPixelValue } from '../Text/Text.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Text',
	'Group',
	'Points',
	'Link',
	'data',
	'value',
	'x',
	'y',
	'seriesKey',
	'placement',
	'layout',
	'occlude',
	'links',
	'offset',
	'format',
	'key',
	'children',
	'class',
	'fill',
	'opacity'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Labels_base($$anchor, $$props) {
	$.push($$props, true);

	let placement = $.prop($$props, 'placement', 3, 'outside'),
		offset = $.prop($$props, 'offset', 19, () => placement() === 'center' || placement() === 'middle' ? 0 : 4),
		key = $.prop($$props, 'key', 3, (_, i) => i),
		restProps = $.rest_props($$props, rest_excludes);

	const linkProps = $.derived(() => typeof $$props.links === 'object' ? $$props.links : {});

	const c = new LabelsState(() => ({
		data: $$props.data,
		value: $$props.value,
		x: $$props.x,
		y: $$props.y,
		seriesKey: $$props.seriesKey,
		placement: placement(),
		layout: $$props.layout,
		occlude: $$props.occlude,
		links: $$props.links,
		offset: offset(),
		format: $$props.format,
		fill: $$props.fill,
		opacity: $$props.opacity,
		fontSize: $$props.fontSize
	}));

	// Make the `fontSize` prop win over the `.lc-labels-text` CSS default (a bare
	// `font-size` attribute would lose to the class rule).
	const fontSizeVar = $.derived(() => $$props.fontSize != null
		? `--labels-font-size: ${getPixelValue($$props.fontSize)}px`
		: undefined);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $$props.Group, ($$anchor, Group_1) => {
		Group_1($$anchor, {
			class: 'lc-labels-g',
			get opacity() {
				return c.derivedOpacity;
			},

			get style() {
				return $.get(fontSizeVar);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					const children = ($$anchor, $$arg0) => {
						let points = () => ($$arg0?.()).points;
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						{
							var consequent_3 = ($$anchor) => {
								const voronoiLabels = $.derived(() => c.getVoronoiLabels(points()));
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.each(node_3, 19, points, (point, i) => key()(point.data, i), ($$anchor, point, i) => {
									const item = $.derived(() => $.get(voronoiLabels)[$.get(i)]);
									var fragment_4 = $.comment();
									var node_4 = $.first_child(fragment_4);

									{
										var consequent_2 = ($$anchor) => {
											const textProps = $.derived(() => extractLayerProps($.get(item).textProps, 'lc-labels-text'));
											var fragment_5 = $.comment();
											var node_5 = $.first_child(fragment_5);

											{
												var consequent = ($$anchor) => {
													var fragment_6 = $.comment();
													var node_6 = $.first_child(fragment_6);

													$.snippet(node_6, () => $$props.children, () => ({
														data: $.get(point),
														textProps: $.get(textProps),
														link: $.get(item).link
													}));

													$.append($$anchor, fragment_6);
												};

												var alternate = ($$anchor) => {
													var fragment_7 = root();
													var node_7 = $.first_child(fragment_7);

													{
														var consequent_1 = ($$anchor) => {
															var fragment_8 = $.comment();
															var node_8 = $.first_child(fragment_8);

															{
																let $0 = $.derived(() => cls('lc-labels-link', typeof $.get(linkProps).class === 'string' ? $.get(linkProps).class : undefined));

																$.component(node_8, () => $$props.Link, ($$anchor, Link_1) => {
																	Link_1($$anchor, $.spread_props(
																		{
																			get x1() {
																				return $.get(item).link.x1;
																			},

																			get y1() {
																				return $.get(item).link.y1;
																			},

																			get x2() {
																				return $.get(item).link.x2;
																			},

																			get y2() {
																				return $.get(item).link.y2;
																			},
																			type: 'straight'
																		},
																		() => $.get(linkProps),
																		{
																			get class() {
																				return $.get($0);
																			}
																		}
																	));
																});
															}

															$.append($$anchor, fragment_8);
														};

														$.if(node_7, ($$render) => {
															if ($.get(item).link && $$props.Link) $$render(consequent_1);
														});
													}

													var node_9 = $.sibling(node_7, 2);

													{
														let $0 = $.derived(() => extractLayerProps($.get(item).textProps, 'lc-labels-text', $$props.class ?? ''));

														$.component(node_9, () => $$props.Text, ($$anchor, Text_1) => {
															Text_1($$anchor, $.spread_props(() => $.get(textProps), () => restProps, () => $.get($0)));
														});
													}

													$.append($$anchor, fragment_7);
												};

												$.if(node_5, ($$render) => {
													if ($$props.children) $$render(consequent); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_5);
										};

										$.if(node_4, ($$render) => {
											if ($.get(item).visible) $$render(consequent_2);
										});
									}

									$.append($$anchor, fragment_4);
								});

								$.append($$anchor, fragment_3);
							};

							var alternate_2 = ($$anchor) => {
								var fragment_9 = $.comment();
								var node_10 = $.first_child(fragment_9);

								$.each(node_10, 19, points, (point, i) => key()(point.data, i), ($$anchor, point, i) => {
									const baseProps = $.derived(() => c.getTextProps($.get(point), points(), $.get(i)));
									const textProps = $.derived(() => extractLayerProps($.get(baseProps), 'lc-labels-text'));
									var fragment_10 = $.comment();
									var node_11 = $.first_child(fragment_10);

									{
										var consequent_4 = ($$anchor) => {
											var fragment_11 = $.comment();
											var node_12 = $.first_child(fragment_11);

											$.snippet(node_12, () => $$props.children, () => ({ data: $.get(point), textProps: $.get(textProps) }));
											$.append($$anchor, fragment_11);
										};

										var alternate_1 = ($$anchor) => {
											var fragment_12 = $.comment();
											var node_13 = $.first_child(fragment_12);

											{
												let $0 = $.derived(() => extractLayerProps($.get(baseProps), 'lc-labels-text', $$props.class ?? ''));

												$.component(node_13, () => $$props.Text, ($$anchor, Text_2) => {
													Text_2($$anchor, $.spread_props(
														{
															get 'data-placement'() {
																return placement();
															}
														},
														() => $.get(textProps),
														() => restProps,
														() => $.get($0)
													));
												});
											}

											$.append($$anchor, fragment_12);
										};

										$.if(node_11, ($$render) => {
											if ($$props.children) $$render(consequent_4); else $$render(alternate_1, -1);
										});
									}

									$.append($$anchor, fragment_10);
								});

								$.append($$anchor, fragment_9);
							};

							$.if(node_2, ($$render) => {
								if ($$props.layout === 'voronoi') $$render(consequent_3); else $$render(alternate_2, -1);
							});
						}

						$.append($$anchor, fragment_2);
					};

					$.component(node_1, () => $$props.Points, ($$anchor, Points_1) => {
						Points_1($$anchor, {
							get data() {
								return $$props.data;
							},

							get x() {
								return $$props.x;
							},

							get y() {
								return $$props.y;
							},

							get seriesKey() {
								return $$props.seriesKey;
							},
							children,
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}