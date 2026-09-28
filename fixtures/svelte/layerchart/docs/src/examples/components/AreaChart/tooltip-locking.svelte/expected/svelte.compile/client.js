import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { accessor, AreaChart, defaultChartPadding, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { format } from '@layerstack/utils';
import { Button, Kbd } from 'svelte-ux';

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <div class="text-xs">Lock position with <!> and view console</div>`, 1);

export default function Tooltip_locking($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 30,
		min: 10,
		max: 100,
		value: 'integer',
		keys: ['apples', 'bananas', 'oranges']
	});

	let lockedTooltip = $.state(false);
	var $$exports = { data };

	$.event('keydown', $.window, (e) => {
		if (e.metaKey) {
			$.set(lockedTooltip, true);
		}
	});

	$.event('keyup', $.window, (e) => {
		if (!e.metaKey) {
			$.set(lockedTooltip, false);
		}
	});

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			let setHighlightKey = () => ($$arg0?.()).setHighlightKey;
			let series = () => ($$arg0?.()).series;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(($0) => $.set_text(text, $0), [() => format(context().x(data()), 'day')]);
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_3 = $.first_child(fragment_4);

								$.each(node_3, 17, series, $.index, ($$anchor, s) => {
									const valueAccessor = $.derived(() => accessor($.get(s).value ?? $.get(s).key));
									const value = $.derived(() => Math.abs($.get(valueAccessor)(data())));
									var fragment_5 = $.comment();
									var node_4 = $.first_child(fragment_5);

									$.component(node_4, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											get label() {
												return $.get(s).key;
											},

											get color() {
												return $.get(s).color;
											},
											onpointerenter: () => setHighlightKey()($.get(s).key),
											onpointerleave: () => setHighlightKey()(null),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_6 = root();
												var text_1 = $.first_child(fragment_6);
												var node_5 = $.sibling(text_1);

												Button(node_5, {
													variant: 'fill-light',
													size: 'sm',
													class: 'ml-2',
													$$events: {
														click: () => {
															console.log('You clicked on the "' + $.get(s).key + '" series with value:"' + $.get(value) + '"');
														}
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Click me');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});

												$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''} `), [() => format($.get(value))]);
												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					var node_6 = $.sibling(node_2, 2);

					$.component(node_6, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
						Tooltip_Separator($$anchor, {});
					});

					var div = $.sibling(node_6, 2);
					var node_7 = $.sibling($.child(div));

					Kbd(node_7, { command: true });
					$.next();
					$.reset(div);
					$.append($$anchor, fragment_2);
				};

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { pointerEvents: true, children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => ({ tooltip: { context: { locked: $.get(lockedTooltip) } } }));
		let $1 = $.derived(() => defaultChartPadding({ right: 10 }));

		AreaChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'oranges', color: 'var(--color-oranges)' }
			],

			get props() {
				return $.get($0);
			},

			get padding() {
				return $.get($1);
			},
			height: 300,
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	return $.pop($$exports);
}