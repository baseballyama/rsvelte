import 'svelte/internal/disclose-version';
import { getDailyTemperature } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { LinearGradient, LineChart, Highlight, Spline, Tooltip } from 'layerchart';
import { format } from '@layerstack/utils';

const data = await getDailyTemperature();
var root = $.from_html(`<!> <!>`, 1);

export default function Gradient_threshold($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const thresholdOffset = $.derived(() => context().yScale(50) / (context().height + context().padding.top + context().padding.bottom));

			{
				const children = ($$anchor, $$arg0) => {
					let gradient = () => ($$arg0?.()).gradient;

					Spline($$anchor, {
						get stroke() {
							return gradient();
						}
					});
				};

				let $0 = $.derived(() => [
					[$.get(thresholdOffset), 'var(--color-danger)'],
					[$.get(thresholdOffset), 'var(--color-info)']
				]);

				LinearGradient($$anchor, {
					get stops() {
						return $.get($0);
					},
					units: 'userSpaceOnUse',
					vertical: true,
					children,
					$$slots: { default: true }
				});
			}
		};

		const highlight = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_3 = $.comment();
			var node = $.first_child(fragment_3);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => ({
							fill: context().y(context().tooltip.data) > 50 ? 'var(--color-danger)' : 'var(--color-info)'
						}));

						Highlight($$anchor, {
							lines: true,
							get points() {
								return $.get($0);
							}
						});
					}
				};

				$.if(node, ($$render) => {
					if (context().tooltip.data) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_3);
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_5 = $.comment();
			var node_1 = $.first_child(fragment_5);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					const value = $.derived(() => context().y(data()));
					var fragment_6 = root();
					var node_2 = $.first_child(fragment_6);

					$.component(node_2, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(($0) => $.set_text(text, $0), [() => format(context().x(data()))]);
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = $.comment();
								var node_4 = $.first_child(fragment_8);

								{
									let $0 = $.derived(() => $.get(value) > 50 ? 'var(--color-danger)' : 'var(--color-info)');

									$.component(node_4, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'value',
											get value() {
												return $.get(value);
											},

											get color() {
												return $.get($0);
											}
										});
									});
								}

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_6);
				};

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_5);
		};

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			yDomain: null,
			height: 300,
			marks,
			highlight,
			tooltip,
			$$slots: { marks: true, highlight: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}