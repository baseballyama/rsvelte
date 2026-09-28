import * as $ from 'svelte/internal/server';
import { CardGrid } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { webhook } from './store';
import Delete from './delete.svelte';
import { toLocaleDateTime } from '$lib/helpers/date';
import { Card, Typography } from '@appwrite.io/pink-svelte';
import { Click, trackEvent } from '$lib/actions/analytics';

export default function DangerZone($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let showDelete = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->The webhook will be permanently deleted. This action is irreversible.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Delete webhooks`);
						}
					},

					aside: ($$renderer) => {
						{
							if (Card.Base) {
								$$renderer.push('<!--[-->');

								Card.Base($$renderer, {
									variant: 'secondary',
									padding: 's',
									children: ($$renderer) => {
										if (Typography.Text) {
											$$renderer.push('<!--[-->');

											Typography.Text($$renderer, {
												variant: 'm-600',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$webhook', webhook).name)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Typography.Text) {
											$$renderer.push('<!--[-->');

											Typography.Text($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Last updated: ${$.escape(toLocaleDateTime($.store_get($$store_subs ??= {}, '$webhook', webhook).$updatedAt))}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}
					},

					actions: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
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

			Delete($$renderer, {
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