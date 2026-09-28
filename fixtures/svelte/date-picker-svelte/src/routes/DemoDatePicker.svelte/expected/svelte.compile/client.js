import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DatePicker from '$lib/DatePicker.svelte';
import { localeFromDateFnsLocale } from '$lib/locale.js';
import Prop from './prop.svelte';
import Split from './split.svelte';
import { hy, de, nb } from 'date-fns/locale';

var root = $.from_html(`<div class="left" slot="left"><!></div>`);
var root_1 = $.from_html(`<span style="font-family:monospace">(date: Date) =&gt; boolean</span>`);
var root_2 = $.from_html(`<span style="font-family:monospace">(date: Date) =&gt; void</span>`);
var root_3 = $.from_html(`<div slot="right"><h3 class="no-top">Props</h3> <!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function DemoDatePicker($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(null);
	const now = new Date();
	let initialBrowseDate = $.state($.proxy(now));
	let min = $.state($.proxy(new Date(now.getFullYear() - 20, 0, 1)));
	let max = $.state($.proxy(new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)));

	let locales = [
		{ key: 'default', value: localeFromDateFnsLocale({}) },
		{ key: 'nb (date-fns)', value: localeFromDateFnsLocale(nb) },
		{ key: 'de (date-fns)', value: localeFromDateFnsLocale(de) },
		{ key: 'hy (date-fns)', value: localeFromDateFnsLocale(hy) }
	];

	let locale = $.state($.proxy(locales[3]));
	let browseWithoutSelecting = $.state(false);
	let timePrecision = $.state('millisecond');

	Split($$anchor, {
		$$slots: {
			left: ($$anchor, $$slotProps) => {
				var div = root();
				var node = $.child(div);

				DatePicker(node, {
					get initialBrowseDate() {
						return $.get(initialBrowseDate);
					},

					get min() {
						return $.get(min);
					},

					get max() {
						return $.get(max);
					},

					get locale() {
						return $.get(locale).value;
					},

					get browseWithoutSelecting() {
						return $.get(browseWithoutSelecting);
					},

					get timePrecision() {
						return $.get(timePrecision);
					},

					get value() {
						return $.get(value);
					},

					set value($$value) {
						$.set(value, $$value, true);
					}
				});

				$.reset(div);
				$.append($$anchor, div);
			},

			right: ($$anchor, $$slotProps) => {
				var div_1 = root_3();
				var node_1 = $.sibling($.child(div_1), 2);

				Prop(node_1, {
					label: 'value',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(value)));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Prop(node_2, {
					label: 'initialBrowseDate',
					get value() {
						return $.get(initialBrowseDate);
					},

					set value($$value) {
						$.set(initialBrowseDate, $$value, true);
					}
				});

				var node_3 = $.sibling(node_2, 2);

				Prop(node_3, {
					label: 'min',
					get value() {
						return $.get(min);
					},

					set value($$value) {
						$.set(min, $$value, true);
					}
				});

				var node_4 = $.sibling(node_3, 2);

				Prop(node_4, {
					label: 'max',
					get value() {
						return $.get(max);
					},

					set value($$value) {
						$.set(max, $$value, true);
					}
				});

				var node_5 = $.sibling(node_4, 2);

				Prop(node_5, {
					label: 'locale',
					get values() {
						return locales;
					},

					get value() {
						return $.get(locale);
					},

					set value($$value) {
						$.set(locale, $$value, true);
					}
				});

				var node_6 = $.sibling(node_5, 2);

				Prop(node_6, {
					label: 'browseWithoutSelecting',
					get value() {
						return $.get(browseWithoutSelecting);
					},

					set value($$value) {
						$.set(browseWithoutSelecting, $$value, true);
					}
				});

				var node_7 = $.sibling(node_6, 2);

				Prop(node_7, {
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

						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, $.get(timePrecision)));
						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_8 = $.sibling(node_7, 2);

				Prop(node_8, {
					label: 'isDisabledDate',
					children: ($$anchor, $$slotProps) => {
						var span = root_1();

						$.append($$anchor, span);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Prop(node_9, {
					label: 'onselect',
					children: ($$anchor, $$slotProps) => {
						var span_1 = root_2();

						$.append($$anchor, span_1);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);
				$.append($$anchor, div_1);
			}
		}
	});

	$.pop();
}