import * as $ from 'svelte/internal/server';
import { box } from 'svelte-toolbelt';
import { useEmojiPickerSkinToneSelector } from './emoji-picker.svelte.js';
import Button from '$lib/components/button.svelte';
import { cn } from '$lib/utils.js';

export default function Emoji_picker_skin_tone_selector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			previewEmoji = '👋',
			variant = 'outline',
			size = 'icon',
			class: className,
			onclick,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const skinState = useEmojiPickerSkinToneSelector({ previewEmoji: box.with(() => previewEmoji) });

		Button($$renderer, $.spread_props([
			rest, /* eslint-disable-line @typescript-eslint/no-explicit-any */
			{
				variant,
				size,
				class: cn('size-8', className),
				onclick: (e) => {
					onclick?.(e);
					skinState.cycleSkinTone();
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(skinState.preview)}`);
				},
				$$slots: { default: true }
			}
		]));
	});
}