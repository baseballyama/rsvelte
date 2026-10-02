import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Id, Tab } from '$lib/components';
import Tabs from '$lib/components/tabs.svelte';
import { isTabSelected } from '$lib/helpers/load';
import { Cover, CoverTitle } from '$lib/layout';
import { domain } from './store';

var root = $.from_html(`<!> <!>`, 1);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $domain = () => $.store_get(domain, '$domain', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const path = `${base}/organization-${page.params.organization}/domains/domain-${page.params.domain}`;

	const tabs = [
		{ href: path, title: 'DNS records', event: 'dns-records' },
		// {
		//     href: `${path}/certificates`,
		//     title: 'Certificates',
		//     event: 'certificates'
		// },
		{
			href: `${path}/settings`,
			title: 'Settings',
			event: 'settings'
		}
	];

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
					let $0 = $.derived(() => `${base}/organization-${page.params.organization}/domains`);

					CoverTitle(node_1, {
						get href() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $domain().domain));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				}

				var node_2 = $.sibling(node_1, 2);

				Id(node_2, {
					get value() {
						return $domain().$id;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text();

						$.template_effect(() => $.set_text(text_2, $domain().$id));
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