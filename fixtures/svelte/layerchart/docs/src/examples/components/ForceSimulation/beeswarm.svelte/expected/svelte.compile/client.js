import 'svelte/internal/disclose-version';
import { getUsSenators } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { scaleOrdinal } from 'd3-scale';
import { forceX, forceY, forceCollide } from 'd3-force';
import { asAny, Axis, Chart, Circle, Layer, Tooltip } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';

let usSenators = await getUsSenators();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Beeswarm($$anchor, $$props) {
	$.push($$props, true);

	const nodes = $.derived(() => usSenators);
	const genderColor = scaleOrdinal(['var(--color-info)', 'var(--color-warning)']);
	const xForce = forceX().strength(0.95);
	const yForce = forceY().strength(0.075);
	const collideForce = forceCollide();

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const r = $.derived(() => 6);
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Layer(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Axis(node_2, { placement: 'bottom', format: 'none', rule: true, grid: true });

					var node_3 = $.sibling(node_2, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let nodes = () => ($$arg0?.()).nodes;
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.each(node_4, 17, nodes, $.index, ($$anchor, node) => {
								{
									let $0 = $.derived(() => genderColor($.get(node).gender));

									Circle($$anchor, {
										get cx() {
											return $.get(node).x;
										},

										get cy() {
											return $.get(node).y;
										},
										r: $.get(r),
										get fill() {
											return $.get($0);
										},
										class: 'stroke-surface-100',
										onpointermove: (e) => context().tooltip.show(e, $.get(node)),
										get onpointerleave() {
											return context().tooltip.hide;
										}
									});
								}
							});

							$.append($$anchor, fragment_3);
						};

						let $0 = $.derived(() => ({
							x: xForce.x((d) => context().xGet(asAny(d))),
							y: yForce.y(context().height / 2),
							collide: collideForce.radius($.get(r))
						}));

						let $1 = $.derived(() => ({ nodes: $.get(nodes) }));

						ForceSimulation(node_3, {
							get forces() {
								return $.get($0);
							},

							get data() {
								return $.get($1);
							},
							static: true,
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_1, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_5 = root();
					var node_6 = $.first_child(fragment_5);

					$.component(node_6, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().name));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_7 = $.sibling(node_6, 2);

					$.component(node_7, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root_1();
								var node_8 = $.first_child(fragment_7);

								$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Birth date',
										get value() {
											return data().date_of_birth;
										},
										format: 'day'
									});
								});

								var node_9 = $.sibling(node_8, 2);

								$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'State',
										get value() {
											return data().state_name;
										}
									});
								});

								var node_10 = $.sibling(node_9, 2);

								$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'Party',
										get value() {
											return data().party;
										}
									});
								});

								var node_11 = $.sibling(node_10, 2);

								$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
									Tooltip_Item_3($$anchor, {
										label: 'Gender',
										get value() {
											return data().gender;
										}
									});
								});

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				};

				$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, {
			get data() {
				return usSenators;
			},
			x: (d) => d.date_of_birth.getFullYear(),
			xNice: true,
			padding: { bottom: 20, left: 12, right: 12 },
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	$.pop();
}