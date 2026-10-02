import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DateInput from '$lib/DateInput.svelte';
import Prop from './prop.svelte';
import Split from './split.svelte';
import { localeFromDateFnsLocale } from '$lib';
import { hy, de, nb } from 'date-fns/locale';
import { toText, toValidDate } from '$lib/date-utils';
import { createFormat } from '$lib/parse';

var root = $.from_html(`<span style="font-family:monospace">ClassValue</span>`);
var root_1 = $.from_html(`<span style="font-family:monospace">(date: Date) =&gt; boolean</span>`);
var root_2 = $.from_html(`<span style="font-family:monospace">(date: Date) =&gt; void</span>`);
var root_3 = $.from_html(`<h3 class="no-top">Props</h3> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function DemoDateInput($$anchor, $$props) {
	$.push($$props, true);

	let locales = [
		{ key: 'default', value: localeFromDateFnsLocale({}) },
		{ key: 'nb (date-fns)', value: localeFromDateFnsLocale(nb) },
		{ key: 'de (date-fns)', value: localeFromDateFnsLocale(de) },
		{ key: 'hy (date-fns)', value: localeFromDateFnsLocale(hy) }
	];

	let localeEntry = $.state($.proxy(locales[0]));
	let value = $.state(null);
	const now = new Date();
	let initialBrowseDate = $.state($.proxy(now));
	let min = $.state($.proxy(new Date(now.getFullYear() - 20, 0, 1)));
	let max = $.state($.proxy(new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)));
	let id = $.state(null);
	let placeholder = $.state('2020-12-31 23:00:00');
	let valid = $.state(true);
	let disabled = $.state(false);
	let required = $.state(false);
	let format = $.state('yyyy-MM-dd HH:mm:ss');
	let isDisabledDate = null;

	// svelte-ignore state_referenced_locally
	let text = $.state($.proxy(toText(
		$.get(value)
			? toValidDate($.get(initialBrowseDate), $.get(value), $.get(min), $.get(max), isDisabledDate)
			: $.get(value),
		createFormat($.get(format), $.get(localeEntry).value)
	)));

	let visible = $.state(false);
	let closeOnSelection = $.state(false);
	let browseWithoutSelecting = $.state(false);
	let timePrecision = $.state(null);
	let dynamicPositioning = $.state(true);

	Split($$anchor, {
		$$slots: {
			left: ($$anchor, $$slotProps) => {
				DateInput($$anchor, {
					slot: 'left',
					get id() {
						return $.get(id);
					},

					get initialBrowseDate() {
						return $.get(initialBrowseDate);
					},

					get min() {
						return $.get(min);
					},

					get max() {
						return $.get(max);
					},

					get placeholder() {
						return $.get(placeholder);
					},

					get format() {
						return $.get(format);
					},

					get disabled() {
						return $.get(disabled);
					},

					get required() {
						return $.get(required);
					},

					get closeOnSelection() {
						return $.get(closeOnSelection);
					},

					get browseWithoutSelecting() {
						return $.get(browseWithoutSelecting);
					},

					get dynamicPositioning() {
						return $.get(dynamicPositioning);
					},

					get timePrecision() {
						return $.get(timePrecision);
					},

					get locale() {
						return $.get(localeEntry).value;
					},

					get value() {
						return $.get(value);
					},

					set value($$value) {
						$.set(value, $$value, true);
					},

					get valid() {
						return $.get(valid);
					},

					set valid($$value) {
						$.set(valid, $$value, true);
					},

					get visible() {
						return $.get(visible);
					},

					set visible($$value) {
						$.set(visible, $$value, true);
					},

					get text() {
						return $.get(text);
					},

					set text($$value) {
						$.set(text, $$value, true);
					}
				});
			},

			right: ($$anchor, $$slotProps) => {
				var fragment_2 = root_3();
				var node = $.sibling($.first_child(fragment_2), 2);

				Prop(node, {
					label: 'value',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, $.get(value)));
						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_1 = $.sibling(node, 2);

				Prop(node_1, {
					label: 'initialBrowseDate',
					get value() {
						return $.get(initialBrowseDate);
					},

					set value($$value) {
						$.set(initialBrowseDate, $$value, true);
					}
				});

				var node_2 = $.sibling(node_1, 2);

				Prop(node_2, {
					label: 'min',
					get value() {
						return $.get(min);
					},

					set value($$value) {
						$.set(min, $$value, true);
					}
				});

				var node_3 = $.sibling(node_2, 2);

				Prop(node_3, {
					label: 'max',
					get value() {
						return $.get(max);
					},

					set value($$value) {
						$.set(max, $$value, true);
					}
				});

				var node_4 = $.sibling(node_3, 2);

				Prop(node_4, {
					label: 'id',
					get value() {
						return $.get(id);
					},

					set value($$value) {
						$.set(id, $$value, true);
					}
				});

				var node_5 = $.sibling(node_4, 2);

				Prop(node_5, {
					label: 'placeholder',
					get value() {
						return $.get(placeholder);
					},

					set value($$value) {
						$.set(placeholder, $$value, true);
					}
				});

				var node_6 = $.sibling(node_5, 2);

				Prop(node_6, {
					label: 'valid',
					get value() {
						return $.get(valid);
					},

					set value($$value) {
						$.set(valid, $$value, true);
					}
				});

				var node_7 = $.sibling(node_6, 2);

				Prop(node_7, {
					label: 'format',
					get value() {
						return $.get(format);
					},

					set value($$value) {
						$.set(format, $$value, true);
					}
				});

				var node_8 = $.sibling(node_7, 2);

				Prop(node_8, {
					label: 'visible',
					get value() {
						return $.get(visible);
					},

					set value($$value) {
						$.set(visible, $$value, true);
					}
				});

				var node_9 = $.sibling(node_8, 2);

				Prop(node_9, {
					label: 'disabled',
					get value() {
						return $.get(disabled);
					},

					set value($$value) {
						$.set(disabled, $$value, true);
					}
				});

				var node_10 = $.sibling(node_9, 2);

				Prop(node_10, {
					label: 'required',
					get value() {
						return $.get(required);
					},

					set value($$value) {
						$.set(required, $$value, true);
					}
				});

				var node_11 = $.sibling(node_10, 2);

				Prop(node_11, {
					label: 'closeOnSelection',
					get value() {
						return $.get(closeOnSelection);
					},

					set value($$value) {
						$.set(closeOnSelection, $$value, true);
					}
				});

				var node_12 = $.sibling(node_11, 2);

				Prop(node_12, {
					label: 'browseWithoutSelecting',
					get value() {
						return $.get(browseWithoutSelecting);
					},

					set value($$value) {
						$.set(browseWithoutSelecting, $$value, true);
					}
				});

				var node_13 = $.sibling(node_12, 2);

				Prop(node_13, {
					label: 'dynamicPositioning',
					get value() {
						return $.get(dynamicPositioning);
					},

					set value($$value) {
						$.set(dynamicPositioning, $$value, true);
					}
				});

				var node_14 = $.sibling(node_13, 2);

				Prop(node_14, {
					label: 'locale',
					get values() {
						return locales;
					},

					get value() {
						return $.get(localeEntry);
					},

					set value($$value) {
						$.set(localeEntry, $$value, true);
					}
				});

				var node_15 = $.sibling(node_14, 2);

				Prop(node_15, {
					label: 'text',
					get value() {
						return $.get(text);
					},

					set value($$value) {
						$.set(text, $$value, true);
					}
				});

				var node_16 = $.sibling(node_15, 2);

				Prop(node_16, {
					label: 'timePrecision',
					values: [null, 'minute', 'second', 'millisecond'],
					get value() {
						return $.get(timePrecision);
					},

					set value($$value) {
						$.set(timePrecision, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, $.get(timePrecision)));
						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_17 = $.sibling(node_16, 2);

				Prop(node_17, {
					label: 'class',
					children: ($$anchor, $$slotProps) => {
						var span = root();

						$.append($$anchor, span);
					},
					$$slots: { default: true }
				});

				var node_18 = $.sibling(node_17, 2);

				Prop(node_18, {
					label: 'isDisabledDate',
					children: ($$anchor, $$slotProps) => {
						var span_1 = root_1();

						$.append($$anchor, span_1);
					},
					$$slots: { default: true }
				});

				var node_19 = $.sibling(node_18, 2);

				Prop(node_19, {
					label: 'onselect',
					children: ($$anchor, $$slotProps) => {
						var span_2 = root_2();

						$.append($$anchor, span_2);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			}
		}
	});

	$.pop();
}