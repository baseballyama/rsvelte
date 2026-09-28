import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import LightSwitch from '$lib/components/common/LightSwitch/LightSwitch.svelte';
import Logo from '$lib/components/common/Logo/Logo.svelte';
import { AppBar } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<a href="https://skeleton.dev/docs/design/themes" title="Skeleton" class="flex items-center gap-4"><!></a>`);
var root_1 = $.from_html(`<a class="btn hover:preset-tonal">Create</a> <a class="btn hover:preset-tonal">Import</a>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function AppHeader($$anchor, $$props) {
	$.push($$props, true);

	AppBar($$anchor, {
		class: 'sticky top-0 z-10 border-b-[1px] border-surface-500/20 bg-surface-50-950',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => AppBar.Toolbar, ($$anchor, AppBar_Toolbar) => {
				AppBar_Toolbar($$anchor, {
					class: 'grid-cols-[auto_1fr_auto] justify-between',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => AppBar.Lead, ($$anchor, AppBar_Lead) => {
							AppBar_Lead($$anchor, {
								class: 'flex items-center gap-6',
								children: ($$anchor, $$slotProps) => {
									var a = root();
									var node_2 = $.child(a);

									Logo(node_2, {});
									$.reset(a);
									$.append($$anchor, a);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => AppBar.Headline, ($$anchor, AppBar_Headline) => {
							AppBar_Headline($$anchor, {
								class: 'flex opacity-60',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var a_1 = $.first_child(fragment_3);
									var a_2 = $.sibling(a_1, 2);

									$.template_effect(
										($0, $1) => {
											$.set_attribute(a_1, 'href', $0);
											$.set_attribute(a_2, 'href', $1);
										},
										[
											() => resolve('/themes/create'),
											() => resolve('/themes/import')
										]
									);

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => AppBar.Trail, ($$anchor, AppBar_Trail) => {
							AppBar_Trail($$anchor, {
								class: 'flex items-center gap-4',
								children: ($$anchor, $$slotProps) => {
									LightSwitch($$anchor, {});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}