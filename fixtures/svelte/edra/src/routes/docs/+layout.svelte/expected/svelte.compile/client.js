import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AppSidebar from '$lib/components/custom/AppSidebar.svelte';
import * as Sidebar from '$lib/components/ui/sidebar/index.js';
import ToggleMode from '$lib/components/custom/ToggleMode.svelte';
import { Button } from '$lib/components/ui/button/index.js';
import './layout.css';
import { initPackageManager } from '$lib/edra/docs/packageManager.svelte.js';

var root = $.from_html(`<header class="sticky top-0 z-10! flex h-14 shrink-0 items-center justify-between gap-2 bg-background/80 px-4 backdrop-blur-xl"><div class="flex items-center gap-2"><!> <span class="text-sm font-medium text-muted-foreground">Documentation</span></div> <div class="flex items-center gap-4"><!> <!></div></header> <main class="mx-auto w-full max-w-4xl flex-1 overflow-y-auto p-6 md:p-10"><!></main>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);
	initPackageManager();

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			class: '[&_a]:no-underline!',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				AppSidebar(node_1, { variant: 'sidebar' });

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var header = $.first_child(fragment_2);
							var div = $.child(header);
							var node_3 = $.child(div);

							$.component(node_3, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
								Sidebar_Trigger($$anchor, { class: '-ml-1' });
							});

							$.next(2);
							$.reset(div);

							var div_1 = $.sibling(div, 2);
							var node_4 = $.child(div_1);

							Button(node_4, {
								variant: 'ghost',
								class: 'text-sm font-medium',
								href: '/',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Back to Home');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_5 = $.sibling(node_4, 2);

							ToggleMode(node_5, {});
							$.reset(div_1);
							$.reset(header);

							var main = $.sibling(header, 2);
							var node_6 = $.child(main);

							$.snippet(node_6, () => $$props.children);
							$.reset(main);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}