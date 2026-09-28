import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Cover, CoverTitle } from '$lib/layout';
import { key } from './store';
import { RegionEndpoint, Copy } from '$lib/components';
import { Layout, Tag, Icon } from '@appwrite.io/pink-svelte';
import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
import { projectRegion } from '../../../store';

var root = $.from_html(`<span class="api-secret-label svelte-10isjst">API secret</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $key = () => $.store_get(key, '$key', $$stores);
	const $projectRegion = () => $.store_get(projectRegion, '$projectRegion', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const projectId = page.params.project;

	Cover($$anchor, {
		$$slots: {
			header: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => `${base}/project-${page.params.region}-${projectId}/overview/api-keys`);

					CoverTitle(node, {
						get href() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $key()?.name));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				}

				var node_1 = $.sibling(node, 2);

				$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						direction: 'row',
						inline: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_2 = $.first_child(fragment_3);

							{
								var consequent = ($$anchor) => {
									Copy($$anchor, {
										get value() {
											return $key().secret;
										},
										copyText: 'Copy API secret',
										children: ($$anchor, $$slotProps) => {
											Tag($$anchor, {
												size: 'xs',
												variant: 'code',
												children: ($$anchor, $$slotProps) => {
													var span = root();

													$.append($$anchor, span);
												},

												$$slots: {
													default: true,
													start: ($$anchor, $$slotProps) => {
														Icon($$anchor, {
															get icon() {
																return IconDuplicate;
															},
															size: 's',
															slot: 'start'
														});
													}
												}
											});
										},
										$$slots: { default: true }
									});
								};

								$.if(node_2, ($$render) => {
									if ($key()?.secret) $$render(consequent);
								});
							}

							var node_3 = $.sibling(node_2, 2);

							{
								var consequent_1 = ($$anchor) => {
									RegionEndpoint($$anchor, {
										get region() {
											return $projectRegion();
										}
									});
								};

								$.if(node_3, ($$render) => {
									if ($projectRegion()) $$render(consequent_1);
								});
							}

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			}
		}
	});

	$.pop();
	$$cleanup();
}