import * as $ from 'svelte/internal/server';
import DateInput from '$lib/DateInput.svelte';
import Prop from './prop.svelte';
import Split from './split.svelte';
import { localeFromDateFnsLocale } from '$lib';
import { hy, de, nb } from 'date-fns/locale';
import { toText, toValidDate } from '$lib/date-utils';
import { createFormat } from '$lib/parse';

export default function DemoDateInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let locales = [
			{ key: 'default', value: localeFromDateFnsLocale({}) },
			{ key: 'nb (date-fns)', value: localeFromDateFnsLocale(nb) },
			{ key: 'de (date-fns)', value: localeFromDateFnsLocale(de) },
			{ key: 'hy (date-fns)', value: localeFromDateFnsLocale(hy) }
		];

		let localeEntry = locales[0];
		let value = null;
		const now = new Date();
		let initialBrowseDate = now;
		let min = new Date(now.getFullYear() - 20, 0, 1);
		let max = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
		let id = null;
		let placeholder = '2020-12-31 23:00:00';
		let valid = true;
		let disabled = false;
		let required = false;
		let format = 'yyyy-MM-dd HH:mm:ss';
		let isDisabledDate = null;

		// svelte-ignore state_referenced_locally
		let text = toText(
			value
				? toValidDate(initialBrowseDate, value, min, max, isDisabledDate)
				: value,
			createFormat(format, localeEntry.value)
		);

		let visible = false;
		let closeOnSelection = false;
		let browseWithoutSelecting = false;
		let timePrecision = null;
		let dynamicPositioning = true;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Split($$renderer, {
				$$slots: {
					left: ($$renderer) => {
						DateInput($$renderer, {
							slot: 'left',
							id,
							initialBrowseDate,
							min,
							max,
							placeholder,
							format,
							disabled,
							required,
							closeOnSelection,
							browseWithoutSelecting,
							dynamicPositioning,
							timePrecision,
							locale: localeEntry.value,
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							get valid() {
								return valid;
							},

							set valid($$value) {
								valid = $$value;
								$$settled = false;
							},

							get visible() {
								return visible;
							},

							set visible($$value) {
								visible = $$value;
								$$settled = false;
							},

							get text() {
								return text;
							},

							set text($$value) {
								text = $$value;
								$$settled = false;
							}
						});
					},

					right: ($$renderer) => {
						{
							$$renderer.push(`<h3 class="no-top">Props</h3> `);

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
								label: 'id',
								get value() {
									return id;
								},

								set value($$value) {
									id = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Prop($$renderer, {
								label: 'placeholder',
								get value() {
									return placeholder;
								},

								set value($$value) {
									placeholder = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Prop($$renderer, {
								label: 'valid',
								get value() {
									return valid;
								},

								set value($$value) {
									valid = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Prop($$renderer, {
								label: 'format',
								get value() {
									return format;
								},

								set value($$value) {
									format = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Prop($$renderer, {
								label: 'visible',
								get value() {
									return visible;
								},

								set value($$value) {
									visible = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Prop($$renderer, {
								label: 'disabled',
								get value() {
									return disabled;
								},

								set value($$value) {
									disabled = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Prop($$renderer, {
								label: 'required',
								get value() {
									return required;
								},

								set value($$value) {
									required = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Prop($$renderer, {
								label: 'closeOnSelection',
								get value() {
									return closeOnSelection;
								},

								set value($$value) {
									closeOnSelection = $$value;
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
								label: 'dynamicPositioning',
								get value() {
									return dynamicPositioning;
								},

								set value($$value) {
									dynamicPositioning = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Prop($$renderer, {
								label: 'locale',
								values: locales,
								get value() {
									return localeEntry;
								},

								set value($$value) {
									localeEntry = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							Prop($$renderer, {
								label: 'text',
								get value() {
									return text;
								},

								set value($$value) {
									text = $$value;
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
								label: 'class',
								children: ($$renderer) => {
									$$renderer.push(`<span style="font-family:monospace">ClassValue</span>`);
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

							$$renderer.push(`<!---->`);
						}
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