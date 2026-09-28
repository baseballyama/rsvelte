import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Blockquote } from "flowbite-svelte";

export default function Center($$anchor) {
	Blockquote($$anchor, {
		alignment: 'center',
		size: 'xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('"Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to complex dashboard. Perfect choice for your next SaaS application."');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}