import * as $ from 'svelte/internal/server';
import { box } from 'svelte-toolbelt';
import { useEmojiPicker } from './emoji-picker.svelte.js';
import { Command as CommandPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Emoji_picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = '',
			skin = 0,
			onSelect = () => {},
			showRecents = false,
			recentsKey = '',
			maxRecents = 12,
			onSkinChange = () => {},
			class: className,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const state = useEmojiPicker({
			value: box.with(() => value, (v) => value = v),
			skin: box.with(() => skin, (v) => skin = v),
			showRecents: box.with(() => showRecents),
			recentsKey: box.with(() => recentsKey),
			maxRecents: box.with(() => maxRecents),
			onSelect: box.with(() => onSelect),
			onSkinChange: box.with(() => onSkinChange)
		});

		if (CommandPrimitive.Root) {
			$$renderer.push('<!--[-->');

			CommandPrimitive.Root($$renderer, $.spread_props([
				rest,
				{
					columns: 6,
					shouldFilter: false,
					class: cn('max-w-[232px]', className),
					onValueChange: state.onValueChange,
					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { value, skin });
	});
}