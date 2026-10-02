import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NodeViewContent, NodeViewWrapper } from '../../tiptap/index.js';
import * as Popover from '$lib/components/ui/popover/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import { cn } from '$lib/utils.js';
import { buttonVariants } from '$lib/components/ui/button/button.svelte';

var root = $.from_html(`<div class="flex flex-col gap-1.5"><label for="emoji" class="text-[10px] font-bold text-muted-foreground uppercase">Emoji Icon</label> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div contenteditable="false" class="mt-0.5 flex items-start select-none"><!></div> <div class="min-w-2 flex-1 leading-relaxed"><!></div>`, 1);

export default function Callout($$anchor, $$props) {
	$.push($$props, true);

	let emoji = $.derived(() => $$props.node.attrs.emoji ?? '💡');

	function handleEmojiInput(e) {
		const target = e.target;

		if (target.value) {
			const emojiChar = Array.from(target.value)[0] || '💡';

			$$props.updateAttributes({ emoji: emojiChar });
		}
	}

	{
		let $0 = $.derived(() => cn('my-4 flex gap-3 rounded-lg border bg-muted p-4 transition-colors dark:bg-muted/50'));

		NodeViewWrapper($$anchor, {
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var div = $.first_child(fragment_1);
				var node_1 = $.child(div);

				$.component(node_1, () => Popover.Root, ($$anchor, Popover_Root) => {
					Popover_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							{
								let $0 = $.derived(() => buttonVariants({ variant: 'ghost', size: 'icon', class: 'p-0! text-lg' }));

								$.component(node_2, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
									Popover_Trigger($$anchor, {
										get class() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, $.get(emoji)));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});
							}

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									class: 'flex w-48 flex-col gap-2 shadow-lg',
									side: 'bottom',
									align: 'start',
									children: ($$anchor, $$slotProps) => {
										var div_1 = root();
										var node_4 = $.sibling($.child(div_1), 2);

										Input(node_4, {
											id: 'emoji',
											get value() {
												return $.get(emoji);
											},
											oninput: handleEmojiInput,
											placeholder: 'Paste or type an emoji...',
											class: 'h-8 text-sm',
											maxlength: 10
										});

										$.reset(div_1);
										$.append($$anchor, div_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var div_2 = $.sibling(div, 2);
				var node_5 = $.child(div_2);

				NodeViewContent(node_5, { class: 'edra-callout-content' });
				$.reset(div_2);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}