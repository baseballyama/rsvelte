import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { box } from 'svelte-toolbelt';
import { useEmojiPickerSkinToneSelector } from './emoji-picker.svelte.js';
import Button from '$lib/components/button.svelte';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'previewEmoji',
	'variant',
	'size',
	'class',
	'onclick'
]);

export default function Emoji_picker_skin_tone_selector($$anchor, $$props) {
	$.push($$props, true);

	let previewEmoji = $.prop($$props, 'previewEmoji', 3, '👋'),
		variant = $.prop($$props, 'variant', 3, 'outline'),
		size = $.prop($$props, 'size', 3, 'icon'),
		rest = $.rest_props($$props, rest_excludes);

	const skinState = useEmojiPickerSkinToneSelector({ previewEmoji: box.with(() => previewEmoji()) });

	{
		let $0 = $.derived(() => cn('size-8', $$props.class));

		Button($$anchor, $.spread_props(() => rest, {
			get variant() {
				return variant();
			},

			get size() {
				return size();
			},

			get class() {
				return $.get($0);
			},

			onclick: (e) => {
				$$props.onclick?.(e);
				skinState.cycleSkinTone();
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, skinState.preview));
				$.append($$anchor, text);
			},
			$$slots: { default: true }
		}));
	}

	$.pop();
}