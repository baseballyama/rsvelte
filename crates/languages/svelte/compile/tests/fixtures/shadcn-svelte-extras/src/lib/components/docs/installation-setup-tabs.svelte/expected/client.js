import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import JsrepoCommand from '$lib/components/docs/jsrepo-command.svelte';
import * as UnderlineTabs from '$lib/components/ui/underline-tabs';
import * as Code from '$lib/components/ui/code';
import JsrepoLogo from '$lib/components/logos/jsrepo.svelte';
import ShadcnSvelteLogo from '$lib/components/logos/shadcn-svelte.svelte';
import PmCommand from '../ui/pm-command/pm-command.svelte';

var root = $.from_html(`<!> jsrepo <span class="text-muted-foreground bg-muted rounded-md px-1.5 py-0.5 text-xs">Recommended</span>`, 1);
var root_1 = $.from_html(`<!> shadcn-svelte`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<p class="leading-7 [&amp;:not(:first-child)]:mt-6">Initialize jsrepo with shadcn-svelte-extras:</p> <!> <p class="leading-7 [&amp;:not(:first-child)]:mt-6">Configure the <code class="bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-sm">paths</code> key in your <code class="bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-sm">jsrepo.config.ts</code> file so that components, hooks, and utils are added to the correct places:</p> <div class="not-prose mt-6 w-full min-w-0"><!></div> <p class="leading-7 [&amp;:not(:first-child)]:mt-6">Install extras into your project using <code class="bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-sm">jsrepo add</code>:</p> <!>`, 1);
var root_4 = $.from_html(`<p class="leading-7 [&amp;:not(:first-child)]:mt-6">Install extras into your project using <code class="bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-sm">shadcn-svelte add</code>:</p> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);

export default function Installation_setup_tabs($$anchor) {
	const jsrepoConfigExample = `import { defineConfig } from 'jsrepo';

export default defineConfig({
	registries: ['@ieedan/shadcn-svelte-extras'],
	paths: {
		ui: '$lib/components/ui',
		component: '$lib/components',
		hook: '$lib/hooks',
		action: '$lib/actions',
		util: '$lib/utils',
		lib: '$lib'
	}
});`;

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => UnderlineTabs.Root, ($$anchor, UnderlineTabs_Root) => {
		UnderlineTabs_Root($$anchor, {
			value: 'jsrepo',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_5();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => UnderlineTabs.List, ($$anchor, UnderlineTabs_List) => {
					UnderlineTabs_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger) => {
								UnderlineTabs_Trigger($$anchor, {
									value: 'jsrepo',
									class: 'flex items-center gap-2',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										JsrepoLogo(node_3, {});
										$.next(2);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => UnderlineTabs.Trigger, ($$anchor, UnderlineTabs_Trigger_1) => {
								UnderlineTabs_Trigger_1($$anchor, {
									value: 'shadcn-svelte',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_5 = $.first_child(fragment_4);

										ShadcnSvelteLogo(node_5, {});
										$.next();
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_1, 2);

				$.component(node_6, () => UnderlineTabs.Content, ($$anchor, UnderlineTabs_Content) => {
					UnderlineTabs_Content($$anchor, {
						value: 'jsrepo',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_3();
							var node_7 = $.sibling($.first_child(fragment_5), 2);

							JsrepoCommand(node_7, {
								command: 'execute',
								args: ['jsrepo', 'init', '@ieedan/shadcn-svelte-extras']
							});

							var div = $.sibling(node_7, 4);
							var node_8 = $.child(div);

							$.component(node_8, () => Code.Root, ($$anchor, Code_Root) => {
								Code_Root($$anchor, {
									lang: 'typescript',
									code: jsrepoConfigExample,
									highlight: [[5, 12]],
									class: 'w-full min-w-0',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_9 = $.first_child(fragment_6);

										$.component(node_9, () => Code.CopyButton, ($$anchor, Code_CopyButton) => {
											Code_CopyButton($$anchor, {});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);

							var node_10 = $.sibling(div, 4);

							JsrepoCommand(node_10, { command: 'execute', args: ['jsrepo', 'add', 'button'] });
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_6, 2);

				$.component(node_11, () => UnderlineTabs.Content, ($$anchor, UnderlineTabs_Content_1) => {
					UnderlineTabs_Content_1($$anchor, {
						value: 'shadcn-svelte',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_4();
							var node_12 = $.sibling($.first_child(fragment_7), 2);

							PmCommand(node_12, {
								command: 'execute',
								args: [
									'shadcn-svelte',
									'add',
									'https://shadcn-svelte-extras.com/r/button.json'
								]
							});

							$.append($$anchor, fragment_7);
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
}