import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <span class="truncate"> </span>`, 1);
var root_1 = $.from_html(`<div class="[&amp;>svg]:text-muted-foreground/80 flex items-center gap-2 [&amp;>svg]:shrink-0"><!></div>`);
var root_2 = $.from_html(` <span class="text-muted-foreground mt-1 block text-xs"> </span>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<header class="border-b px-4 md:px-6"><div class="flex h-16 items-center justify-between gap-4"><div><!></div> <div class="flex items-center justify-end gap-2"><!> <!></div></div></header>`);

export default function Navbar_15($$anchor, $$props) {
	$.push($$props, true);

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

	let selectedModel = $.state($.proxy(aiModels[0].value));
	var header = root_4();
	var div = $.child(header);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Select(node, {
		type: 'single',
		get items() {
			return aiModels;
		},
		onValueChange: (value) => $.set(selectedModel, value, true),
		children: ($$anchor, $$slotProps) => {
			var fragment = root_3();
			var node_1 = $.first_child(fragment);

			SelectTrigger(node_1, {
				children: ($$anchor, $$slotProps) => {
					var div_2 = root_1();
					var node_2 = $.child(div_2);

					{
						var consequent = ($$anchor) => {
							var fragment_1 = root();
							var node_3 = $.first_child(fragment_1);

							BotMessageSquareIcon(node_3, { size: 16, 'aria-hidden': 'true' });

							var span = $.sibling(node_3, 2);
							var text = $.only_child(span, true);

							$.template_effect(($0) => $.set_text(text, $0), [
								() => aiModels.find((model) => model.value === $.get(selectedModel))?.label || 'Choose an AI model'
							]);

							$.append($$anchor, fragment_1);
						};

						$.if(node_2, ($$render) => {
							if ($.get(selectedModel)) $$render(consequent);
						});
					}

					$.reset(div_2);
					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			SelectContent(node_4, {
				class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2',
				children: ($$anchor, $$slotProps) => {
					SelectGroup($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_3();
							var node_5 = $.first_child(fragment_3);

							SelectGroupHeading(node_5, {
								class: 'ps-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Models');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							$.each(node_6, 17, () => aiModels, (aiModel) => aiModel.value, ($$anchor, aiModel) => {
								SelectItem($$anchor, {
									get value() {
										return $.get(aiModel).value;
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_5 = root_2();
										var text_2 = $.first_child(fragment_5);
										var span_1 = $.sibling(text_2);
										var text_3 = $.only_child(span_1, true);

										$.template_effect(() => {
											$.set_text(text_2, `${$.get(aiModel).label ?? ''} `);
											$.set_text(text_3, $.get(aiModel).description);
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_7 = $.child(div_3);

	Button(node_7, {
		size: 'icon',
		variant: 'ghost',
		class: 'text-muted-foreground size-8 rounded-full shadow-none',
		'aria-label': 'Temporary chat',
		children: ($$anchor, $$slotProps) => {
			MessageCircleDashedIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	UserMenu(node_8, {});
	$.reset(div_3);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
	$.pop();
}