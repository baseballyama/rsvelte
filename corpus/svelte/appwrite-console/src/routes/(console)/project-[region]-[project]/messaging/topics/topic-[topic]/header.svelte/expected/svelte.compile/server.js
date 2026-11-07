import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Id, Tab, Tabs } from '$lib/components';
import { isTabSelected } from '$lib/helpers/load';
import { Cover, CoverTitle } from '$lib/layout';
import { canWriteTopics } from '$lib/stores/roles';
import { topic } from './store';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const projectId = page.params.project;
		const topicId = page.params.topic;
		const path = `${base}/project-${page.params.region}-${projectId}/messaging/topics/topic-${topicId}`;

		const tabs = [
			{ href: path, title: 'Subscribers', event: 'subscribers' },
			{
				href: `${path}/settings`,
				title: 'Settings',
				event: 'settings',
				disabled: !$.store_get($$store_subs ??= {}, '$canWriteTopics', canWriteTopics)
			}
		].filter((tab) => !tab.disabled);

		Cover($$renderer, {
			children: ($$renderer) => {
				Tabs($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(tabs);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let tab = each_array[$$index];

							Tab($$renderer, {
								href: tab.href,
								selected: isTabSelected(tab, page.url.pathname, path, tabs),
								event: tab.event,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(tab.title)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},

			$$slots: {
				default: true,
				header: ($$renderer) => {
					{
						CoverTitle($$renderer, {
							href: `${base}/project-${page.params.region}-${projectId}/messaging/topics`,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$topic', topic).name)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Id($$renderer, {
							value: $.store_get($$store_subs ??= {}, '$topic', topic).$id,
							event: 'topic',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$topic', topic).$id)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}