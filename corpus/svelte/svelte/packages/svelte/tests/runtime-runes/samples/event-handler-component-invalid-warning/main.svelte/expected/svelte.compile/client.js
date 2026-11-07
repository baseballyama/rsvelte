import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from './Button.svelte';

export default function Main($$anchor) {
	let count = $.state(0);

	{
		let $0 = $.derived(() => $.update(count));

		Button($$anchor, {
			get onclick() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));
				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	}
}