import * as $ from 'svelte/internal/server';
import { Layout } from '@appwrite.io/pink-svelte';
import ColumnItem from './columns/columnItem.svelte';
import { toRelationalField } from '$database/(entity)';

export default function RelatedRowColumns($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { workStore, columnsToRender, onUpdateFormValues, gap = 'l' } = $$props;

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				direction: 'column',
				gap,
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(columnsToRender);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let column = each_array[$$index];
						const label = column.key;

						ColumnItem($$renderer, {
							label,
							editing: true,
							formValues: $.store_get($$store_subs ??= {}, '$workStore', workStore),
							column: toRelationalField(column),
							onUpdateFormValues
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}