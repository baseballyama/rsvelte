import * as $ from 'svelte/internal/server';
import JsrepoCommand from '$lib/components/docs/jsrepo-command.svelte';
import * as UnderlineTabs from '$lib/components/ui/underline-tabs';
import * as Code from '$lib/components/ui/code';
import JsrepoLogo from '$lib/components/logos/jsrepo.svelte';
import ShadcnSvelteLogo from '$lib/components/logos/shadcn-svelte.svelte';
import PmCommand from '../ui/pm-command/pm-command.svelte';

export default function Installation_setup_tabs($$renderer) {
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

	if (UnderlineTabs.Root) {
		$$renderer.push('<!--[-->');

		UnderlineTabs.Root($$renderer, {
			value: 'jsrepo',
			children: ($$renderer) => {
				if (UnderlineTabs.List) {
					$$renderer.push('<!--[-->');

					UnderlineTabs.List($$renderer, {
						children: ($$renderer) => {
							if (UnderlineTabs.Trigger) {
								$$renderer.push('<!--[-->');

								UnderlineTabs.Trigger($$renderer, {
									value: 'jsrepo',
									class: 'flex items-center gap-2',
									children: ($$renderer) => {
										JsrepoLogo($$renderer, {});
										$$renderer.push(`<!----> jsrepo <span class="text-muted-foreground bg-muted rounded-md px-1.5 py-0.5 text-xs">Recommended</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (UnderlineTabs.Trigger) {
								$$renderer.push('<!--[-->');

								UnderlineTabs.Trigger($$renderer, {
									value: 'shadcn-svelte',
									children: ($$renderer) => {
										ShadcnSvelteLogo($$renderer, {});
										$$renderer.push(`<!----> shadcn-svelte`);
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

				$$renderer.push(` `);

				if (UnderlineTabs.Content) {
					$$renderer.push('<!--[-->');

					UnderlineTabs.Content($$renderer, {
						value: 'jsrepo',
						children: ($$renderer) => {
							$$renderer.push(`<p class="leading-7 [&amp;:not(:first-child)]:mt-6">Initialize jsrepo with shadcn-svelte-extras:</p> `);

							JsrepoCommand($$renderer, {
								command: 'execute',
								args: ['jsrepo', 'init', '@ieedan/shadcn-svelte-extras']
							});

							$$renderer.push(`<!----> <p class="leading-7 [&amp;:not(:first-child)]:mt-6">Configure the <code class="bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-sm">paths</code> key in your <code class="bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-sm">jsrepo.config.ts</code> file so that components, hooks, and utils are added to the correct places:</p> <div class="not-prose mt-6 w-full min-w-0">`);

							if (Code.Root) {
								$$renderer.push('<!--[-->');

								Code.Root($$renderer, {
									lang: 'typescript',
									code: jsrepoConfigExample,
									highlight: [[5, 12]],
									class: 'w-full min-w-0',
									children: ($$renderer) => {
										if (Code.CopyButton) {
											$$renderer.push('<!--[-->');
											Code.CopyButton($$renderer, {});
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

							$$renderer.push(`</div> <p class="leading-7 [&amp;:not(:first-child)]:mt-6">Install extras into your project using <code class="bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-sm">jsrepo add</code>:</p> `);
							JsrepoCommand($$renderer, { command: 'execute', args: ['jsrepo', 'add', 'button'] });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (UnderlineTabs.Content) {
					$$renderer.push('<!--[-->');

					UnderlineTabs.Content($$renderer, {
						value: 'shadcn-svelte',
						children: ($$renderer) => {
							$$renderer.push(`<p class="leading-7 [&amp;:not(:first-child)]:mt-6">Install extras into your project using <code class="bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-sm">shadcn-svelte add</code>:</p> `);

							PmCommand($$renderer, {
								command: 'execute',
								args: [
									'shadcn-svelte',
									'add',
									'https://shadcn-svelte-extras.com/r/button.json'
								]
							});

							$$renderer.push(`<!---->`);
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