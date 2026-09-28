import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as EmojiPicker from '$lib/components/ui/emoji-picker';
import { toast } from 'svelte-sonner';

var root = $.from_html(`<!> <!>`, 1);

export default function Emoji_picker_skin($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => EmojiPicker.Root, ($$anchor, EmojiPicker_Root) => {
		EmojiPicker_Root($$anchor, {
			disableInitialScroll: true,
			skin: 3,
			onSelect: (selected) => toast.success(`You selected ${selected.emoji}`),
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => EmojiPicker.Viewport, ($$anchor, EmojiPicker_Viewport) => {
					EmojiPicker_Viewport($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => EmojiPicker.Search, ($$anchor, EmojiPicker_Search) => {
								EmojiPicker_Search($$anchor, { value: 'hand' });
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => EmojiPicker.List, ($$anchor, EmojiPicker_List) => {
								EmojiPicker_List($$anchor, {});
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