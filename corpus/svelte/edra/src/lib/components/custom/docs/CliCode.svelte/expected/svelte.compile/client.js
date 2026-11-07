import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getPackageManager } from '$lib/edra/docs/packageManager.svelte.js';
import Code from './Code.svelte';
import * as Tabs from '$lib/components/ui/tabs/index.js';

var root = $.from_html(`<div><div class="flex items-center gap-1"><!></div> <!></div>`);

export default function CliCode($$anchor, $$props) {
	$.push($$props, true);

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

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			get value() {
				return state.value;
			},

			set value($$value) {
				state.value = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.each(node_2, 17, () => managers, $.index, ($$anchor, mgr) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
									Tabs_Trigger($$anchor, {
										get value() {
											return $.get(mgr).value;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, $.get(mgr).label));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	$.key(node_4, () => state.value, ($$anchor) => {
		Code($$anchor, {
			get code() {
				return commands[$$props.type][state.value];
			},
			language: 'shell'
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}