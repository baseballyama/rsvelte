import * as $ from 'svelte/internal/server';
import { NodeViewContent, NodeViewWrapper } from '../../tiptap/index.js';
import Popover from '../primitives/Popover.svelte';

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
			class: 'callout-wrapper',
			children: ($$renderer) => {
				$$renderer.push(`<div contenteditable="false" class="emoji-trigger-container svelte-7q149v">`);

				{
					function trigger($$renderer) {
						$$renderer.push(`<button class="edra-btn edra-btn-ghost edra-btn-icon emoji-trigger-btn svelte-7q149v">${$.escape(emoji())}</button>`);
					}

					Popover($$renderer, {
						trigger,
						children: ($$renderer) => {
							$$renderer.push(`<div class="emoji-popover-content svelte-7q149v"><div class="input-wrapper svelte-7q149v"><label for="emoji" class="emoji-label svelte-7q149v">Emoji Icon</label> <input id="emoji"${$.attr('value', emoji())} placeholder="Paste or type an emoji..." class="edra-input emoji-input svelte-7q149v"${$.attr('maxlength', 10)}/></div></div>`);
						},
						$$slots: { trigger: true, default: true }
					});
				}

				$$renderer.push(`<!----></div> <div class="callout-content-container svelte-7q149v">`);
				NodeViewContent($$renderer, { class: 'edra-callout-content' });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	});
}