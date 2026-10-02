import * as $ from 'svelte/internal/server';
import Button from '$lib/components/ui/button.svelte';
import BotMessageSquareIcon from '@lucide/svelte/icons/bot-message-square';
import MessageCircleDashedIcon from '@lucide/svelte/icons/message-circle-dashed';
import { UserMenu } from '$lib/components/_extras/navbars';

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectGroupHeading,
	SelectItem,
	SelectTrigger
} from '$lib/components/ui/select';

export default function Navbar_15($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const aiModels = [
			{
				description: 'Balanced performance and creativity',
				label: 'Orion-Alpha 4.5',
				value: 'orion-alpha-45'
			},

			{
				description: 'Optimized for code generation and understanding',
				label: 'Orion-Code 4',
				value: 'orion-code-4'
			},

			{
				description: 'Excels at natural, engaging conversations',
				label: 'Nova-Chat 4',
				value: 'nova-chat-4'
			},

			{
				description: 'Most powerful model for complex tasks',
				label: 'Galaxy-Max 4',
				value: 'galaxy-max-4'
			}
		];

		let selectedModel = aiModels[0].value;

		$$renderer.push(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div>`);

		Select($$renderer, {
			type: 'single',
			items: aiModels,
			onValueChange: (value) => selectedModel = value,
			children: ($$renderer) => {
				SelectTrigger($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="[&amp;>svg]:text-muted-foreground/80 flex items-center gap-2 [&amp;>svg]:shrink-0">`);

						if (selectedModel) {
							$$renderer.push('<!--[0-->');
							BotMessageSquareIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
							$$renderer.push(`<!----> <span class="truncate">${$.escape(aiModels.find((model) => model.value === selectedModel)?.label || 'Choose an AI model')}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				SelectContent($$renderer, {
					class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2',
					children: ($$renderer) => {
						SelectGroup($$renderer, {
							children: ($$renderer) => {
								SelectGroupHeading($$renderer, {
									class: 'ps-2',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Models`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> <!--[-->`);

								const each_array = $.ensure_array_like(aiModels);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let aiModel = each_array[$$index];

									SelectItem($$renderer, {
										value: aiModel.value,
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(aiModel.label)} <span class="text-muted-foreground mt-1 block text-xs">${$.escape(aiModel.description)}</span>`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="flex items-center justify-end gap-2">`);

		Button($$renderer, {
			size: 'icon',
			variant: 'ghost',
			class: 'text-muted-foreground size-8 rounded-full shadow-none',
			'aria-label': 'Temporary chat',
			children: ($$renderer) => {
				MessageCircleDashedIcon($$renderer, { size: 16, 'aria-hidden': 'true' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		UserMenu($$renderer, {});
		$$renderer.push(`<!----></div></div></header>`);
	});
}