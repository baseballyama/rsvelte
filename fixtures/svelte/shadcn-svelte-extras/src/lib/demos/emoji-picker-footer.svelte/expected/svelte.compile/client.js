import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as EmojiPicker from '$lib/components/ui/emoji-picker';
import { PersistedState } from 'runed';
import { toast } from 'svelte-sonner';

var root = $.from_html(`<div class="flex w-[calc(100%-40px)] items-center gap-2"><span class="text-lg"> </span> <span class="text-muted-foreground truncate text-xs"> </span></div> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Emoji_picker_footer($$anchor, $$props) {
	$.push($$props, true);

	const skin = new PersistedState('emoji-picker-skin', 0);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => EmojiPicker.Root, ($$anchor, EmojiPicker_Root) => {
		EmojiPicker_Root($$anchor, {
			disableInitialScroll: true,
			onSelect: (selected) => toast.success(`You selected ${selected.emoji}`),
			get skin() {
				return skin.current;
			},

			set skin($$value) {
				skin.current = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => EmojiPicker.Viewport, ($$anchor, EmojiPicker_Viewport) => {
					EmojiPicker_Viewport($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => EmojiPicker.Search, ($$anchor, EmojiPicker_Search) => {
								EmojiPicker_Search($$anchor, {});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => EmojiPicker.List, ($$anchor, EmojiPicker_List) => {
								EmojiPicker_List($$anchor, {});
							});

							var node_4 = $.sibling(node_3, 2);

							{
								const children = ($$anchor, $$arg0) => {
									let active = () => ($$arg0?.()).active;
									var fragment_3 = root();
									var div = $.first_child(fragment_3);
									var span = $.child(div);
									var text = $.only_child(span, true);
									var span_1 = $.sibling(span, 2);
									var text_1 = $.only_child(span_1, true);

									$.reset(div);

									var node_5 = $.sibling(div, 2);

									$.component(node_5, () => EmojiPicker.SkinToneSelector, ($$anchor, EmojiPicker_SkinToneSelector) => {
										EmojiPicker_SkinToneSelector($$anchor, { previewEmoji: '🫵' });
									});

									$.template_effect(() => {
										$.set_text(text, active()?.emoji);
										$.set_text(text_1, active()?.data.name);
									});

									$.append($$anchor, fragment_3);
								};

								$.component(node_4, () => EmojiPicker.Footer, ($$anchor, EmojiPicker_Footer) => {
									EmojiPicker_Footer($$anchor, {
										class: 'flex max-w-full place-items-center gap-2 px-2',
										children,
										$$slots: { default: true }
									});
								});
							}

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