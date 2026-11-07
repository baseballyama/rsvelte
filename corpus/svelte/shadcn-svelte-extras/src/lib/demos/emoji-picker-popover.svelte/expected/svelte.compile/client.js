import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { buttonVariants } from '$lib/components/ui/button';
import * as EmojiPicker from '$lib/components/ui/emoji-picker';
import * as Popover from '$lib/components/ui/popover';
import { cn } from '$lib/utils.js';
import SmilePlusIcon from '@lucide/svelte/icons/smile-plus';
import { toast } from 'svelte-sonner';

var root = $.from_html(`<!> <!>`, 1);

export default function Emoji_picker_popover($$anchor, $$props) {
	$.push($$props, true);

	let emoji = $.state('');
	let open = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => EmojiPicker.Root, ($$anchor, EmojiPicker_Root) => {
		EmojiPicker_Root($$anchor, {
			disableInitialScroll: true,
			onSelect: (selected) => {
				$.set(open, false);
				toast.success(`You selected ${selected.emoji}!`);
			},

			get value() {
				return $.get(emoji);
			},

			set value($$value) {
				$.set(emoji, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Popover.Root, ($$anchor, Popover_Root) => {
					Popover_Root($$anchor, {
						get open() {
							return $.get(open);
						},

						set open($$value) {
							$.set(open, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							{
								let $0 = $.derived(() => cn(buttonVariants({ variant: 'outline', size: 'icon' })));

								$.component(node_2, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
									Popover_Trigger($$anchor, {
										get class() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_3 = $.first_child(fragment_3);

											{
												var consequent = ($$anchor) => {
													SmilePlusIcon($$anchor, {});
												};

												var alternate = ($$anchor) => {
													var text = $.text();

													$.template_effect(() => $.set_text(text, $.get(emoji)));
													$.append($$anchor, text);
												};

												$.if(node_3, ($$render) => {
													if ($.get(emoji) === '') $$render(consequent); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});
							}

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									class: 'w-auto p-0',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_5 = $.first_child(fragment_6);

										$.component(node_5, () => EmojiPicker.Search, ($$anchor, EmojiPicker_Search) => {
											EmojiPicker_Search($$anchor, {});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => EmojiPicker.List, ($$anchor, EmojiPicker_List) => {
											EmojiPicker_List($$anchor, {});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}