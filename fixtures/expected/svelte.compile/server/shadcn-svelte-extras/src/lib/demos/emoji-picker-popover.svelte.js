import * as $ from 'svelte/internal/server';
import { buttonVariants } from '$lib/components/ui/button';
import * as EmojiPicker from '$lib/components/ui/emoji-picker';
import * as Popover from '$lib/components/ui/popover';
import { cn } from '$lib/utils.js';
import SmilePlusIcon from '@lucide/svelte/icons/smile-plus';
import { toast } from 'svelte-sonner';

export default function Emoji_picker_popover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let emoji = '';
		let open = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (EmojiPicker.Root) {
				$$renderer.push('<!--[-->');

				EmojiPicker.Root($$renderer, {
					disableInitialScroll: true,
					onSelect: (selected) => {
						open = false;
						toast.success(`You selected ${selected.emoji}!`);
					},

					get value() {
						return emoji;
					},

					set value($$value) {
						emoji = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Popover.Root) {
							$$renderer.push('<!--[-->');

							Popover.Root($$renderer, {
								get open() {
									return open;
								},

								set open($$value) {
									open = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (Popover.Trigger) {
										$$renderer.push('<!--[-->');

										Popover.Trigger($$renderer, {
											class: cn(buttonVariants({ variant: 'outline', size: 'icon' })),
											children: ($$renderer) => {
												if (emoji === '') {
													$$renderer.push('<!--[0-->');
													SmilePlusIcon($$renderer, {});
												} else {
													$$renderer.push(`<!--[-1-->${$.escape(emoji)}`);
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

									$$renderer.push(` `);

									if (Popover.Content) {
										$$renderer.push('<!--[-->');

										Popover.Content($$renderer, {
											class: 'w-auto p-0',
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