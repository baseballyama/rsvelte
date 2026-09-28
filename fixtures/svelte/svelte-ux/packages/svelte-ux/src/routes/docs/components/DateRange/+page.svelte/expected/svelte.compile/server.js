import * as $ from 'svelte/internal/server';
import { endOfMonth, startOfDay, startOfMonth, startOfYear } from 'date-fns';
import { DateRange, getSettings } from 'svelte-ux';
import { PeriodType, getDateFuncsByPeriodType } from '@layerstack/utils';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { localeSettings } = getSettings();

		let selected = {
			from: new Date('1982-03-01T00:00:00'),
			to: new Date('1982-03-31T23:59:59'),
			periodType: 30
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRange($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Controlled</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRange($$renderer, {
						get selected() {
							return selected;
						},

						set selected($$value) {
							selected = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>PeriodType options</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRange($$renderer, {
						periodTypes: [
							PeriodType.Month,
							PeriodType.Quarter,
							PeriodType.CalendarYear,
							PeriodType.FiscalYearOctober
						]
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Single PeriodType options with presets</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRange($$renderer, { periodTypes: [PeriodType.Day] });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Single PeriodType options without presets</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRange($$renderer, {
						periodTypes: [PeriodType.Day],
						getPeriodTypePresets: () => []
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>PeriodType presets</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					DateRange($$renderer, {
						periodTypes: [PeriodType.Day, PeriodType.Month],
						getPeriodTypePresets: (fnSettings, fnPeriodType) => {
							const { start, end, add } = getDateFuncsByPeriodType($.store_get($$store_subs ??= {}, '$localeSettings', localeSettings), fnPeriodType);

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
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}