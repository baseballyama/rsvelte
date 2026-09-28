import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Tab, Tabs } from '$lib/components';
import { isTabSelected } from '$lib/helpers/load';
import { Cover } from '$lib/layout';
import { canWriteProjects } from '$lib/stores/roles';
import { isCloud } from '$lib/system';
import { Typography } from '@appwrite.io/pink-svelte';

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteProjects = () => $.store_get(canWriteProjects, '$canWriteProjects', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const path = `${base}/project-${page.params.region}-${page.params.project}/settings`;

	const tabs = [
		{ href: path, title: 'Overview', event: 'overview' },
		{
			href: `${path}/domains`,
			title: 'Custom domains',
			event: 'domains'
		},

		{
			href: `${path}/webhooks`,
			title: 'Webhooks',
			event: 'webhooks'
		},

		{
			href: `${path}/migrations`,
			title: 'Migrations',
			event: 'migrations',
			disabled: !$canWriteProjects()
		},

		{
			href: `${path}/smtp`,
			title: 'SMTP',
			event: 'smtp',
			disabled: !$canWriteProjects()
		},

		{
			href: `${path}/usage`,
			title: 'Usage',
			event: 'usage',
			hasChildren: true,
			disabled: !isCloud
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
				var fragment_5 = $.comment();
				var node_1 = $.first_child(fragment_5);

				$.component(node_1, () => Typography.Title, ($$anchor, Typography_Title) => {
					Typography_Title($$anchor, {
						color: '--fgcolor-neutral-primary',
						size: 'xl',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Settings');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			}
		}
	});

	$.pop();
	$$cleanup();
}