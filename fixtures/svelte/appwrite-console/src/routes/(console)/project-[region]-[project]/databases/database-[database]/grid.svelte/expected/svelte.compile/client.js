import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { CardContainer, GridItem1, Id } from '$lib/components';
import { canWriteTables } from '$lib/stores/roles';
import { Badge } from '@appwrite.io/pink-svelte';
import { buildEntityRoute } from '$database/store';
import { onMount } from 'svelte';

export default function Grid($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteTables = () => $.store_get(canWriteTables, '$canWriteTables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showCreate = $.prop($$props, 'showCreate', 15, false);

	onMount(() => {
		/* silences `declared but its value is never read` warning. */
		showCreate();
	});

	{
		let $0 = $.derived(() => !$canWriteTables());

		CardContainer($$anchor, {
			get disableEmpty() {
				return $.get($0);
			},

			get total() {
				return $$props.data.entities.total;
			},

			get event() {
				return $$props.terminology.entity.lower.singular;
			},
			$$events: { click: () => showCreate(true) },
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.each(node, 17, () => $$props.data.entities.entities, $.index, ($$anchor, table) => {
					{
						let $0 = $.derived(() => buildEntityRoute(page, $$props.terminology.entity.lower.singular, $.get(table).$id));

						GridItem1($$anchor, {
							get href() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								Id($$anchor, {
									get value() {
										return $.get(table).$id;
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(table).$id));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							},

							$$slots: {
								default: true,
								title: ($$anchor, $$slotProps) => {
									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, $.get(table).name));
									$.append($$anchor, text_1);
								},

								status: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_1 = $.first_child(fragment_6);

									{
										var consequent = ($$anchor) => {
											Badge($$anchor, { variant: 'secondary', content: 'disabled' });
										};

										$.if(node_1, ($$render) => {
											if (!$.get(table).enabled) $$render(consequent);
										});
									}

									$.append($$anchor, fragment_6);
								}
							}
						});
					}
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}