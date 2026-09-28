import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Cover, CoverTitle } from '$lib/layout';
import { key } from './store';
import { RegionEndpoint, Copy } from '$lib/components';
import { Layout, Tag, Icon } from '@appwrite.io/pink-svelte';
import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
import { projectRegion } from '../../../store';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const projectId = page.params.project;

		Cover($$renderer, {
			$$slots: {
				header: ($$renderer) => {
					{
						CoverTitle($$renderer, {
							href: `${base}/project-${page.params.region}-${projectId}/overview/api-keys`,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$key', key)?.name)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								direction: 'row',
								inline: true,
								children: ($$renderer) => {
									if ($.store_get($$store_subs ??= {}, '$key', key)?.secret) {
										$$renderer.push('<!--[0-->');

										Copy($$renderer, {
											value: $.store_get($$store_subs ??= {}, '$key', key).secret,
											copyText: 'Copy API secret',
											children: ($$renderer) => {
												Tag($$renderer, {
													size: 'xs',
													variant: 'code',
													children: ($$renderer) => {
														$$renderer.push(`<span class="api-secret-label svelte-10isjst">API secret</span>`);
													},

													$$slots: {
														default: true,
														start: ($$renderer) => {
															Icon($$renderer, { icon: IconDuplicate, size: 's', slot: 'start' });
														}
													}
												});
											},
											$$slots: { default: true }
										});
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if ($.store_get($$store_subs ??= {}, '$projectRegion', projectRegion)) {
										$$renderer.push('<!--[0-->');

										RegionEndpoint($$renderer, {
											region: $.store_get($$store_subs ??= {}, '$projectRegion', projectRegion)
										});
									} else {
										$$renderer.push('<!--[-1-->');
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
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}