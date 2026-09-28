import * as $ from 'svelte/internal/server';
import { NodeViewContent, NodeViewWrapper } from '../../tiptap/index.js';
import * as Popover from '$lib/components/ui/popover/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import { cn } from '$lib/utils.js';
import { buttonVariants } from '$lib/components/ui/button/button.svelte';

export default function Callout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { node, updateAttributes } = $$props;
		let emoji = $.derived(() => node.attrs.emoji ?? '💡');

		function handleEmojiInput(e) {
			const target = e.target;

			if (target.value) {
				const emojiChar = Array.from(target.value)[0] || '💡';

				updateAttributes({ emoji: emojiChar });
			}
		}

		NodeViewWrapper($$renderer, {
			class: cn('my-4 flex gap-3 rounded-lg border bg-muted p-4 transition-colors dark:bg-muted/50'),
			children: ($$renderer) => {
				$$renderer.push(`<div contenteditable="false" class="mt-0.5 flex items-start select-none">`);

				if (Popover.Root) {
					$$renderer.push('<!--[-->');

					Popover.Root($$renderer, {
						children: ($$renderer) => {
							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');

								Popover.Trigger($$renderer, {
									class: buttonVariants({ variant: 'ghost', size: 'icon', class: 'p-0! text-lg' }),
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(emoji())}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Popover.Content) {
								$$renderer.push('<!--[-->');

								Popover.Content($$renderer, {
									class: 'flex w-48 flex-col gap-2 shadow-lg',
									side: 'bottom',
									align: 'start',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex flex-col gap-1.5"><label for="emoji" class="text-[10px] font-bold text-muted-foreground uppercase">Emoji Icon</label> `);

										Input($$renderer, {
											id: 'emoji',
											value: emoji(),
											oninput: handleEmojiInput,
											placeholder: 'Paste or type an emoji...',
											class: 'h-8 text-sm',
											maxlength: 10
										});

										$$renderer.push(`<!----></div>`);
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

				$$renderer.push(`</div> <div class="min-w-2 flex-1 leading-relaxed">`);
				NodeViewContent($$renderer, { class: 'edra-callout-content' });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	});
}