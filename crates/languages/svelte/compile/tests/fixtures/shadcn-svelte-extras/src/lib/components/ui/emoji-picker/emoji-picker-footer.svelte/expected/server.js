import * as $ from 'svelte/internal/server';
import { useEmojiPickerFooter } from './emoji-picker.svelte.js';
import { cn } from '$lib/utils.js';

export default function Emoji_picker_footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...rest } = $$props;
		const footerState = useEmojiPickerFooter();

		$$renderer.push(`<div${$.attributes({
			...rest,
			class: $.clsx(cn('border-border relative max-w-full border-t p-2', className))
		})}>`);

		children?.($$renderer, { active: footerState.root.emojiPickerState.active });
		$$renderer.push(`<!----></div>`);
	});
}