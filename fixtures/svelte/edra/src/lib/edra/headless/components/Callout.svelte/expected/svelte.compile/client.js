import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NodeViewContent, NodeViewWrapper } from '../../tiptap/index.js';
import Popover from '../primitives/Popover.svelte';

var root = $.from_html(`<button class="edra-btn edra-btn-ghost edra-btn-icon emoji-trigger-btn svelte-7q149v"> </button>`);
var root_1 = $.from_html(`<div class="emoji-popover-content svelte-7q149v"><div class="input-wrapper svelte-7q149v"><label for="emoji" class="emoji-label svelte-7q149v">Emoji Icon</label> <input id="emoji" placeholder="Paste or type an emoji..." class="edra-input emoji-input svelte-7q149v"/></div></div>`);
var root_2 = $.from_html(`<div contenteditable="false" class="emoji-trigger-container svelte-7q149v"><!></div> <div class="callout-content-container svelte-7q149v"><!></div>`, 1);

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

	NodeViewWrapper($$anchor, {
		class: 'callout-wrapper',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var div = $.first_child(fragment_1);
			var node_1 = $.child(div);

			{
				const trigger = ($$anchor) => {
					var button = root();
					var text = $.only_child(button, true);

					$.template_effect(() => $.set_text(text, $.get(emoji)));
					$.append($$anchor, button);
				};

				Popover(node_1, {
					trigger,
					children: ($$anchor, $$slotProps) => {
						var div_1 = root_1();
						var div_2 = $.child(div_1);
						var input = $.sibling($.child(div_2), 2);

						$.remove_input_defaults(input);
						$.set_attribute(input, 'maxlength', 10);
						$.reset(div_2);
						$.reset(div_1);
						$.template_effect(() => $.set_value(input, $.get(emoji)));
						$.delegated('input', input, handleEmojiInput);
						$.append($$anchor, div_1);
					},
					$$slots: { trigger: true, default: true }
				});
			}

			$.reset(div);

			var div_3 = $.sibling(div, 2);
			var node_2 = $.child(div_3);

			NodeViewContent(node_2, { class: 'edra-callout-content' });
			$.reset(div_3);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['input']);