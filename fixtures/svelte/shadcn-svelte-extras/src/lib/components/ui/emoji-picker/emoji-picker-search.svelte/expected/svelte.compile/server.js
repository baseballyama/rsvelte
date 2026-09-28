import * as $ from 'svelte/internal/server';
import SearchIcon from '@lucide/svelte/icons/search';
import { Command as CommandPrimitive } from 'bits-ui';
import { useEmojiPickerInput } from './emoji-picker.svelte.js';
import { box } from 'svelte-toolbelt';

export default function Emoji_picker_search($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = '',
			placeholder = 'Search',
			$$slots,
			$$events,
			...rest
		} = $$props;

		useEmojiPickerInput({ value: box.with(() => value, (v) => value = v) });

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="p-2"><div class="bg-input border-input dark:bg-input/30 flex h-9 items-center gap-2 rounded-md border px-3">`);
			SearchIcon($$renderer, { class: 'size-4 shrink-0 opacity-50' });
			$$renderer.push(`<!----> `);

			if (CommandPrimitive.Input) {
				$$renderer.push('<!--[-->');

				CommandPrimitive.Input($$renderer, $.spread_props([
					rest,
					{
						placeholder,
						class: 'placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						}
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}