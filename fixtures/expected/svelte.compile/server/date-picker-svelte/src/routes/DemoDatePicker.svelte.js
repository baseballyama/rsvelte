import * as $ from 'svelte/internal/server';
import DatePicker from '$lib/DatePicker.svelte';
import { localeFromDateFnsLocale } from '$lib/locale.js';
import Prop from './prop.svelte';
import Split from './split.svelte';
import { hy, de, nb } from 'date-fns/locale';

export default function DemoDatePicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = null;
		const now = new Date();
		let initialBrowseDate = now;
		let min = new Date(now.getFullYear() - 20, 0, 1);
		let max = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

		let locales = [
			{ key: 'default', value: localeFromDateFnsLocale({}) },
			{ key: 'nb (date-fns)', value: localeFromDateFnsLocale(nb) },
			{ key: 'de (date-fns)', value: localeFromDateFnsLocale(de) },
			{ key: 'hy (date-fns)', value: localeFromDateFnsLocale(hy) }
		];

		let locale = locales[3];
		let browseWithoutSelecting = false;
		let timePrecision = 'millisecond';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Split($$renderer, {
				$$slots: {
					left: ($$renderer) => {
						$$renderer.push(`<div class="left" slot="left">`);

						DatePicker($$renderer, {
							initialBrowseDate,
							min,
							max,
							locale: locale.value,
							browseWithoutSelecting,
							timePrecision,
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div>`);
					},

					right: ($$renderer) => {
						$$renderer.push(`<div slot="right"><h3 class="no-top">Props</h3> `);

						Prop($$renderer, {
							label: 'value',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(value)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Prop($$renderer, {
							label: 'initialBrowseDate',
							get value() {
								return initialBrowseDate;
							},

							set value($$value) {
								initialBrowseDate = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Prop($$renderer, {
							label: 'min',
							get value() {
								return min;
							},

							set value($$value) {
								min = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Prop($$renderer, {
							label: 'max',
							get value() {
								return max;
							},

							set value($$value) {
								max = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Prop($$renderer, {
							label: 'locale',
							values: locales,
							get value() {
								return locale;
							},

							set value($$value) {
								locale = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Prop($$renderer, {
							label: 'browseWithoutSelecting',
							get value() {
								return browseWithoutSelecting;
							},

							set value($$value) {
								browseWithoutSelecting = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						Prop($$renderer, {
							label: 'timePrecision',
							values: [null, 'minute', 'second', 'millisecond'],
							get value() {
								return timePrecision;
							},

							set value($$value) {
								timePrecision = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(timePrecision)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Prop($$renderer, {
							label: 'isDisabledDate',
							children: ($$renderer) => {
								$$renderer.push(`<span style="font-family:monospace">(date: Date) => boolean</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Prop($$renderer, {
							label: 'onselect',
							children: ($$renderer) => {
								$$renderer.push(`<span style="font-family:monospace">(date: Date) => void</span>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}