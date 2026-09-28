import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Parent from './Parent.svelte';
import Child from './Child.svelte';

export default function Main($$anchor) {
	Parent($$anchor, {
		$$slots: {
			item: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);

				Child($$anchor, {
					slot: 'item',
					onclick: () => console.log($.get(item)),
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('asd');

							$.append($$anchor, text);
						}
					}
				});
			}
		}
	});
}