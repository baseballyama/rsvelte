import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { CardContainer, GridItem1, Id } from '$lib/components';
import { canWriteTables } from '$lib/stores/roles';
import { Badge } from '@appwrite.io/pink-svelte';
import { buildEntityRoute } from '$database/store';
import { onMount } from 'svelte';

export default function Grid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data, showCreate = false, terminology } = $$props;

		onMount(() => {
			/* silences `declared but its value is never read` warning. */
			showCreate;
		});

		CardContainer($$renderer, {
			disableEmpty: !$.store_get($$store_subs ??= {}, '$canWriteTables', canWriteTables),
			total: data.entities.total,
			event: terminology.entity.lower.singular,
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(data.entities.entities);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let table = each_array[$$index];

					GridItem1($$renderer, {
						href: buildEntityRoute(page, terminology.entity.lower.singular, table.$id),
						children: ($$renderer) => {
							Id($$renderer, {
								value: table.$id,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(table.$id)}`);
								},
								$$slots: { default: true }
							});
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`${$.escape(table.name)}`);
								}
							},

							status: ($$renderer) => {
								{
									if (!table.enabled) {
										$$renderer.push('<!--[0-->');
										Badge($$renderer, { variant: 'secondary', content: 'disabled' });
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}
							}
						}
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { showCreate });
	});
}