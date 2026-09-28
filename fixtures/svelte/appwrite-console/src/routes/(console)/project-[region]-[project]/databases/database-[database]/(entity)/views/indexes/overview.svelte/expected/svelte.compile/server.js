import * as $ from 'svelte/internal/server';
import { InputText } from '$lib/elements/forms';
import { Layout } from '@appwrite.io/pink-svelte';
import { getTerminologies } from '$database/(entity)';

export default function Overview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { selectedIndex = null } = $$props;
		const { terminology } = getTerminologies();
		const fieldLabel = terminology.field.title.singular;

		InputText($$renderer, {
			required: true,
			id: 'key',
			label: 'Index key',
			placeholder: 'Enter key',
			value: selectedIndex?.key ?? '',
			readonly: true
		});

		$$renderer.push(`<!----> `);

		InputText($$renderer, {
			required: true,
			id: 'type',
			label: 'Index type',
			placeholder: 'Select type',
			value: selectedIndex?.type ?? '',
			readonly: true
		});

		$$renderer.push(`<!----> `);

		if (selectedIndex?.fields?.length) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(selectedIndex.fields);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let field = each_array[i];

				if (Layout.Stack) {
					$$renderer.push('<!--[-->');

					Layout.Stack($$renderer, {
						direction: 'row',
						children: ($$renderer) => {
							InputText($$renderer, {
								required: true,
								label: i === 0 ? fieldLabel : '',
								id: `value-${field}`,
								value: field,
								readonly: true
							});

							$$renderer.push(`<!----> `);

							InputText($$renderer, {
								required: true,
								label: i === 0 ? 'Order' : '',
								id: `value-${selectedIndex?.orders?.[i] ?? ''}`,
								value: selectedIndex?.orders?.[i] ?? '',
								readonly: true
							});

							$$renderer.push(`<!----> `);

							InputText($$renderer, {
								required: true,
								label: i === 0 ? 'Length' : '',
								id: `value-${selectedIndex?.lengths?.[i] ?? ''}`,
								value: selectedIndex.lengths[i]?.toString() ?? null,
								readonly: true
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}