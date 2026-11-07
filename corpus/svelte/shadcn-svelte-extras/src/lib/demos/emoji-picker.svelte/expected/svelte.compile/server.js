import * as $ from 'svelte/internal/server';
import * as EmojiPicker from '$lib/components/ui/emoji-picker';
import { toast } from 'svelte-sonner';

export default function Emoji_picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (EmojiPicker.Root) {
			$$renderer.push('<!--[-->');

			EmojiPicker.Root($$renderer, {
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
	});
}