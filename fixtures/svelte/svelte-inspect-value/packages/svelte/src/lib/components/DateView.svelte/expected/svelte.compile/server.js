import * as $ from 'svelte/internal/server';
import Entry from './Entry.svelte';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import StringValue from './StringValue.svelte';

export default function DateView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, key, type, path, $$slots, $$events, ...rest } = $$props;

		let entries = $.derived(() => Object.entries({
			toString: value.toString(),
			dateString: value.toDateString(),
			utcString: value.toUTCString(),
			year: value.getFullYear(),
			month: value.getMonth(),
			date: value.getDate(),
			day: value.getDay(),
			hour: value.getHours(),
			minutes: value.getMinutes(),
			seconds: value.getSeconds(),
			milliseconds: value.getMilliseconds(),
			time: value.getTime()
		}));

		{
			function valuePreview($$renderer, { showPreview }) {
				if (showPreview) {
					$$renderer.push('<!--[0-->');
					StringValue($$renderer, { type, value: value.toUTCString() });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			Expandable($$renderer, $.spread_props([
				{ value, key, type, path },
				{
					length: entries().length,
					keepPreviewOnExpand: true,
					showLength: false
				},
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(entries());

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let [key, value] = each_array[i];

							Entry($$renderer, {
								i,
								children: ($$renderer) => {
									Node($$renderer, { value, key, path });
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { valuePreview: true, default: true }
				}
			]));
		}
	});
}