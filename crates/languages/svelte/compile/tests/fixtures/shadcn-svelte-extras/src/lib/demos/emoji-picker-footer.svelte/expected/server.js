import * as $ from 'svelte/internal/server';
import * as EmojiPicker from '$lib/components/ui/emoji-picker';
import { PersistedState } from 'runed';
import { toast } from 'svelte-sonner';

export default function Emoji_picker_footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const skin = new PersistedState('emoji-picker-skin', 0);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (EmojiPicker.Root) {
				$$renderer.push('<!--[-->');

				EmojiPicker.Root($$renderer, {
					disableInitialScroll: true,
					onSelect: (selected) => toast.success(`You selected ${selected.emoji}`),
					get skin() {
						return skin.current;
					},

					set skin($$value) {
						skin.current = $$value;
						$$settled = false;
					},

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

									$$renderer.push(` `);

									{
										function children($$renderer, { active }) {
											$$renderer.push(`<div class="flex w-[calc(100%-40px)] items-center gap-2"><span class="text-lg">${$.escape(active?.emoji)}</span> <span class="text-muted-foreground truncate text-xs">${$.escape(active?.data.name)}</span></div> `);

											if (EmojiPicker.SkinToneSelector) {
												$$renderer.push('<!--[-->');
												EmojiPicker.SkinToneSelector($$renderer, { previewEmoji: '🫵' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										if (EmojiPicker.Footer) {
											$$renderer.push('<!--[-->');

											EmojiPicker.Footer($$renderer, {
												class: 'flex max-w-full place-items-center gap-2 px-2',
												children,
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}