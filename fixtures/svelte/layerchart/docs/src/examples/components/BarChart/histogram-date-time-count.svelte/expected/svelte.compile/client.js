import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, defaultChartPadding, Rect, Tooltip, thresholdTime } from 'layerchart';
import { bin } from 'd3-array';
import { randomNormal } from 'd3-random';
import { timeDay } from 'd3-time';
import { format } from '@layerstack/utils';
import HistogramControls from '$lib/components/controls/HistogramControls.svelte';

var root = $.from_html(`<span></span> <span>...</span>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Histogram_date_time_count($$anchor, $$props) {
	$.push($$props, true);

	let randomCount = 1000;
	let random = $.proxy(randomNormal());

	function getRandomDate(from, to) {
		const fromTime = from.getTime();
		const toTime = to.getTime();

		return new Date(fromTime + random() * (toTime - fromTime));
	}

	const now = new Date();
	let dateRange = $.state(10);
	const randomData = $.derived(() => Array.from({ length: randomCount }, () => getRandomDate(timeDay.offset(now, -$.get(dateRange)), now))); // TODO: Make typescript happy
	let thresholds = $.state(10);
	let binByTime = $.derived(() => bin().thresholds(thresholdTime($.get(thresholds) ?? 0)));
	let data = $.derived(() => $.get(binByTime)($.get(randomData)));

	var $$exports = {
		get data() {
			return $.get(data);
		}
	};

	var fragment = root_2();
	var node = $.first_child(fragment);

	HistogramControls(node, {
		get dateRange() {
			return $.get(dateRange);
		},

		set dateRange($$value) {
			$.set(dateRange, $$value, true);
		},

		get thresholds() {
			return $.get(thresholds);
		},

		set thresholds($$value) {
			$.set(thresholds, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		const marks = ($$anchor) => {
			Rect($$anchor, {
				x0: 'x0',
				y0: (d) => 0,
				x1: 'x1',
				y1: 'length',
				insets: { x: 1 },
				class: 'fill-primary'
			});
		};

		const tooltip = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_3 = root_2();
					var node_3 = $.first_child(fragment_3);

					$.component(node_3, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							class: 'text-center',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(($0) => $.set_text(text, $0), [
									() => format(data().x0, 'day') + ' - ' + format(data().x1, 'day')
								]);

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_4 = $.sibling(node_3, 2);

					$.component(node_4, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root_1();
								var node_5 = $.first_child(fragment_5);

								$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'count',
										get value() {
											return data().length;
										},
										format: 'integer'
									});
								});

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
									Tooltip_Separator($$anchor, {});
								});

								var node_7 = $.sibling(node_6, 2);

								$.each(node_7, 17, () => data().slice(0, 5), $.index, ($$anchor, d) => {
									var fragment_6 = $.comment();
									var node_8 = $.first_child(fragment_6);

									$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'value',
											get value() {
												return $.get(d);
											},
											format: 'daytime'
										});
									});

									$.append($$anchor, fragment_6);
								});

								var node_9 = $.sibling(node_7, 2);

								{
									var consequent = ($$anchor) => {
										var fragment_7 = root();

										$.next(2);
										$.append($$anchor, fragment_7);
									};

									$.if(node_9, ($$render) => {
										if (data().length > 5) $$render(consequent);
									});
								}

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.component(node_2, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_2);
		};

		let $0 = $.derived(() => defaultChartPadding({ left: 30, bottom: 30 }));

		Chart(node_1, {
			get data() {
				return $.get(data);
			},
			x: ['x0', 'x1'],
			y: 'length',
			props: { yAxis: { format: 'metric' } },
			motion: { type: 'spring' },
			get padding() {
				return $.get($0);
			},
			height: 300,
			tooltipContext: { mode: 'band' },
			highlight: { area: true },
			clip: true,
			marks,
			tooltip,
			$$slots: { marks: true, tooltip: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}