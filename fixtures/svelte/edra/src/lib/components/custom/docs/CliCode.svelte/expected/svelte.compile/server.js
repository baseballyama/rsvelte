import * as $ from 'svelte/internal/server';
import { getPackageManager } from '$lib/edra/docs/packageManager.svelte.js';
import Code from './Code.svelte';
import * as Tabs from '$lib/components/ui/tabs/index.js';

export default function CliCode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { type } = $$props;
		const state = getPackageManager();

		const commands = {
			headless: {
				npm: 'npx edra@latest init headless',
				pnpm: 'pnpm dlx edra@latest init headless',
				yarn: 'yarn dlx edra@latest init headless',
				bun: 'bunx edra@latest init headless'
			},
			shadcn: {
				npm: 'npx edra@latest init shadcn',
				pnpm: 'pnpm dlx edra@latest init shadcn',
				yarn: 'yarn dlx edra@latest init shadcn',
				bun: 'bunx edra@latest init shadcn'
			},
			registry: {
				npm: 'npx shadcn-svelte@latest add https://edra.tsuzat.com/r/edra.json',
				pnpm: 'pnpm dlx shadcn-svelte@latest add https://edra.tsuzat.com/r/edra.json',
				yarn: 'yarn dlx shadcn-svelte@latest add https://edra.tsuzat.com/r/edra.json',
				bun: 'bunx shadcn-svelte@latest add https://edra.tsuzat.com/r/edra.json'
			},
			'template-ai': {
				npm: 'npx shadcn-svelte@latest add https://edra.tsuzat.com/r/template-ai.json',
				pnpm: 'pnpm dlx shadcn-svelte@latest add https://edra.tsuzat.com/r/template-ai.json',
				yarn: 'yarn dlx shadcn-svelte@latest add https://edra.tsuzat.com/r/template-ai.json',
				bun: 'bunx shadcn-svelte@latest add https://edra.tsuzat.com/r/template-ai.json'
			},
			'template-notion': {
				npm: 'npx shadcn-svelte@latest add https://edra.tsuzat.com/r/template-notion.json',
				pnpm: 'pnpm dlx shadcn-svelte@latest add https://edra.tsuzat.com/r/template-notion.json',
				yarn: 'yarn dlx shadcn-svelte@latest add https://edra.tsuzat.com/r/template-notion.json',
				bun: 'bunx shadcn-svelte@latest add https://edra.tsuzat.com/r/template-notion.json'
			},
			collaboration: {
				npm: 'npm install @hocuspocus/provider @hocuspocus/server yjs @tiptap/extension-collaboration @tiptap/extension-collaboration-caret',
				pnpm: 'pnpm add @hocuspocus/provider @hocuspocus/server yjs @tiptap/extension-collaboration @tiptap/extension-collaboration-caret',
				yarn: 'yarn add @hocuspocus/provider @hocuspocus/server yjs @tiptap/extension-collaboration @tiptap/extension-collaboration-caret',
				bun: 'bun add @hocuspocus/provider @hocuspocus/server yjs @tiptap/extension-collaboration @tiptap/extension-collaboration-caret'
			},
			'shadcn-deps': {
				npm: 'npx shadcn-svelte@latest add button command dropdown-menu separator popover tabs input tooltip textarea sonner',
				pnpm: 'pnpm dlx shadcn-svelte@latest add button command dropdown-menu separator popover tabs input tooltip textarea sonner',
				yarn: 'yarn dlx shadcn-svelte@latest add button command dropdown-menu separator popover tabs input tooltip textarea sonner',
				bun: 'bunx shadcn-svelte@latest add button command dropdown-menu separator popover tabs input tooltip textarea sonner'
			}
		};

		const managers = [
			{ value: 'npm', label: 'npm' },
			{ value: 'pnpm', label: 'pnpm' },
			{ value: 'yarn', label: 'yarn' },
			{ value: 'bun', label: 'bun' }
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div><div class="flex items-center gap-1">`);

			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					get value() {
						return state.value;
					},

					set value($$value) {
						state.value = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(managers);

									for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
										let mgr = each_array[idx];

										if (Tabs.Trigger) {
											$$renderer.push('<!--[-->');

											Tabs.Trigger($$renderer, {
												value: mgr.value,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(mgr.label)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <!---->`);

			{
				Code($$renderer, { code: commands[type][state.value], language: 'shell' });
			}

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}