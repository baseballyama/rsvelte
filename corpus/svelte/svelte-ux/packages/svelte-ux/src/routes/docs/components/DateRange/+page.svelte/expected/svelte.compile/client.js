import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { endOfMonth, startOfDay, startOfMonth, startOfYear } from 'date-fns';
import { DateRange, getSettings } from 'svelte-ux';
import { PeriodType, getDateFuncsByPeriodType } from '@layerstack/utils';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Controlled</h2> <!> <h2>PeriodType options</h2> <!> <h2>Single PeriodType options with presets</h2> <!> <h2>Single PeriodType options without presets</h2> <!> <h2>PeriodType presets</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $localeSettings = () => $.store_get(localeSettings, '$localeSettings', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { localeSettings } = getSettings();

	let selected = {
		from: new Date('1982-03-01T00:00:00'),
		to: new Date('1982-03-31T23:59:59'),
		periodType: 30
	};

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	// $: console.log({ selected });
	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			DateRange($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			DateRange($$anchor, {
				get selected() {
					return selected;
				},

				set selected($$value) {
					selected = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [
					PeriodType.Month,
					PeriodType.Quarter,
					PeriodType.CalendarYear,
					PeriodType.FiscalYearOctober
				]);

				DateRange($$anchor, {
					get periodTypes() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [PeriodType.Day]);

				DateRange($$anchor, {
					get periodTypes() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [PeriodType.Day]);

				DateRange($$anchor, {
					get periodTypes() {
						return $.get($0);
					},
					getPeriodTypePresets: () => []
				});
			}
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [PeriodType.Day, PeriodType.Month]);

				DateRange($$anchor, {
					get periodTypes() {
						return $.get($0);
					},

					getPeriodTypePresets: (fnSettings, fnPeriodType) => {
						const { start, end, add } = getDateFuncsByPeriodType($localeSettings(), fnPeriodType);

						if (fnPeriodType === PeriodType.Day) {
							const today = startOfDay(new Date());
							const yesterday = start(add(today, -1));

							return [
								{
									label: 'Month to date',
									value: {
										from: startOfMonth(today),
										to: end(today),
										periodType: fnPeriodType
									}
								},

								{
									label: 'Year to date',
									value: {
										from: startOfYear(today),
										to: end(today),
										periodType: fnPeriodType
									}
								},

								{
									label: 'Last 30 days',
									value: {
										from: add(yesterday, -29),
										to: end(yesterday),
										periodType: fnPeriodType
									}
								},

								{
									label: 'Last 60 days',
									value: {
										from: add(yesterday, -59),
										to: end(yesterday),
										periodType: fnPeriodType
									}
								},

								{
									label: 'Last 90 days',
									value: {
										from: add(yesterday, -89),
										to: end(yesterday),
										periodType: fnPeriodType
									}
								},

								{
									label: 'Last 180 days',
									value: {
										from: add(yesterday, -179),
										to: end(yesterday),
										periodType: fnPeriodType
									}
								},

								{
									label: 'Last 365 days',
									value: {
										from: add(yesterday, -364),
										to: end(yesterday),
										periodType: fnPeriodType
									}
								}
							];
						} else if (fnPeriodType === PeriodType.Month) {
							const today = endOfMonth(new Date());
							const lastMonth = start(add(today, -1));

							return [
								{
									label: 'Current month', // Month to Date
									value: { from: start(today), to: end(today), periodType: fnPeriodType }
								},

								{
									label: 'Last month',
									value: {
										from: lastMonth,
										to: end(lastMonth),
										periodType: fnPeriodType
									}
								},

								{
									label: 'Last 3 months',
									value: {
										from: start(add(lastMonth, -2)),
										to: end(lastMonth),
										periodType: fnPeriodType
									}
								},

								{
									label: 'Last 6 months',
									value: {
										from: start(add(lastMonth, -5)),
										to: end(lastMonth),
										periodType: fnPeriodType
									}
								},

								{
									label: 'Last 12 months',
									value: {
										from: start(add(lastMonth, -11)),
										to: end(lastMonth),
										periodType: fnPeriodType
									}
								}
							];
						} else {
							return [];
						}
					}
				});
			}
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}