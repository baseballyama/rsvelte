import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Id, Tab, Tabs } from '$lib/components';
import { isTabSelected } from '$lib/helpers/load';
import { Cover, CoverTitle } from '$lib/layout';
import { canWriteTopics } from '$lib/stores/roles';
import { topic } from './store';

var root = $.from_html(`<!> <!>`, 1);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteTopics = () => $.store_get(canWriteTopics, '$canWriteTopics', $$stores);
	const $topic = () => $.store_get(topic, '$topic', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const projectId = page.params.project;
	const topicId = page.params.topic;
	const path = `${base}/project-${page.params.region}-${projectId}/messaging/topics/topic-${topicId}`;

	const tabs = [
		{ href: path, title: 'Subscribers', event: 'subscribers' },
		{
			href: `${path}/settings`,
			title: 'Settings',
			event: 'settings',
			disabled: !$canWriteTopics()
		}
	].filter((tab) => !tab.disabled);

	Cover($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Tabs($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.each(node, 17, () => tabs, $.index, ($$anchor, tab) => {
						{
							let $0 = $.derived(() => isTabSelected($.get(tab), page.url.pathname, path, tabs));

							Tab($$anchor, {
								get href() {
									return $.get(tab).href;
								},

								get selected() {
									return $.get($0);
								},

								get event() {
									return $.get(tab).event;
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, $.get(tab).title));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},

		$$slots: {
			default: true,
			header: ($$anchor, $$slotProps) => {
				var fragment_5 = root();
				var node_1 = $.first_child(fragment_5);

				{
					let $0 = $.derived(() => `${base}/project-${page.params.region}-${projectId}/messaging/topics`);

					CoverTitle(node_1, {
						get href() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $topic().name));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				}

				var node_2 = $.sibling(node_1, 2);

				Id(node_2, {
					get value() {
						return $topic().$id;
					},
					event: 'topic',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, $topic().$id));
						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_5);
			}
		}
	});

	$.pop();
	$$cleanup();
}