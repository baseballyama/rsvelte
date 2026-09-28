import * as $ from 'svelte/internal/server';
import { CardGrid, BoxAvatar } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { topic, topicTotal } from '../store';
import DeleteTopic from '../deleteTopic.svelte';

export default function DangerZone($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let showDelete = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<p>The topic will be permanently deleted, including all data associated with this topic. This
        action is irreversible.</p>`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Delete topic`);
						}
					},

					aside: ($$renderer) => {
						{
							BoxAvatar($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, '$topicTotal', topicTotal))} subscriber${$.escape($.store_get($$store_subs ??= {}, '$topicTotal', topicTotal) === 1 ? '' : 's')}</p>`);
								},

								$$slots: {
									default: true,
									title: ($$renderer) => {
										{
											$$renderer.push(`<h6 class="u-bold u-trim-1">${$.escape($.store_get($$store_subs ??= {}, '$topic', topic).name)}</h6>`);
										}
									}
								}
							});
						}
					},

					actions: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								event: 'delete_messaging_topic',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Delete`);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			DeleteTopic($$renderer, {
				get showDelete() {
					return showDelete;
				},

				set showDelete($$value) {
					showDelete = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}