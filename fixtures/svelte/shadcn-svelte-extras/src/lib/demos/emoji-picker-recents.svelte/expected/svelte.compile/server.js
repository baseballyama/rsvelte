import * as $ from 'svelte/internal/server';
import * as EmojiPicker from '$lib/components/ui/emoji-picker';
import { toast } from 'svelte-sonner';

export default function Emoji_picker_recents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="flex flex-col place-items-center gap-4">`);

		if (EmojiPicker.Root) {
			$$renderer.push('<!--[-->');

			EmojiPicker.Root($$renderer, {
				disableInitialScroll: true,
				showRecents: true,
				recentsKey: 'emoji-picker-recents',
				onSelect: (selected) => toast.success(`You selected ${selected.emoji}`),
				children: ($$renderer) => {
					if (EmojiPicker.Viewport) {
						$$renderer.push('<!--[-->');

						EmojiPicker.Viewport($$renderer, {
							children: ($$renderer) => {
								if (EmojiPicker.Search) {
									$$renderer.push('<!--[-->');
									EmojiPicker.Search($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (EmojiPicker.List) {
									$$renderer.push('<!--[-->');
									EmojiPicker.List($$renderer, {});
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <p class="text-muted-foreground text-center text-sm">Pick an emoji to add it to your recents.</p></div>`);
	});
}