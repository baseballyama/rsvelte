import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as EmojiPicker from '$lib/components/ui/emoji-picker';
import { toast } from 'svelte-sonner';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col place-items-center gap-4"><!> <p class="text-muted-foreground text-center text-sm">Pick an emoji to add it to your recents.</p></div>`);

export default function Emoji_picker_recents($$anchor, $$props) {
	$.push($$props, true);

	var div = root_1();
	var node = $.child(div);

	$.component(node, () => EmojiPicker.Root, ($$anchor, EmojiPicker_Root) => {
		EmojiPicker_Root($$anchor, {
			disableInitialScroll: true,
			showRecents: true,
			recentsKey: 'emoji-picker-recents',
			onSelect: (selected) => toast.success(`You selected ${selected.emoji}`),
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => EmojiPicker.Viewport, ($$anchor, EmojiPicker_Viewport) => {
					EmojiPicker_Viewport($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => EmojiPicker.Search, ($$anchor, EmojiPicker_Search) => {
								EmojiPicker_Search($$anchor, {});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => EmojiPicker.List, ($$anchor, EmojiPicker_List) => {
								EmojiPicker_List($$anchor, {});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}