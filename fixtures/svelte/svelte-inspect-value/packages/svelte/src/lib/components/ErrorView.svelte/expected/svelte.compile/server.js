import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import Entry from './Entry.svelte';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import StringValue from './StringValue.svelte';

export default function ErrorView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, key, type = 'error', path } = $$props;
		let useDefaults = getContext(Symbol.for('siv.use-defaults'));

		let entries = $.derived(() => Object.entries({
			name: value.name,
			message: value.message,
			stack: value.stack,
			cause: value.cause
		}).filter(([, v]) => v != null));

		{
			function valuePreview($$renderer) {
				StringValue($$renderer, { type, value: value.toString() });
			}

			Expandable($$renderer, {
				value,
				key,
				type,
				path,
				length: entries().length,
				keepPreviewOnExpand: true,
				valuePreview,
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(entries());

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let [key, value] = each_array[i];

						Entry($$renderer, {
							i,
							children: ($$renderer) => {
								Node($$renderer, { value, key, path, usedefaults: useDefaults ?? false });
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { valuePreview: true, default: true }
			});
		}
	});
}