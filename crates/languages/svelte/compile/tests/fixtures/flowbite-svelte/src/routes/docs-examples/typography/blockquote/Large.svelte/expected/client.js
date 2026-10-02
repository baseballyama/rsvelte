import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Blockquote } from "flowbite-svelte";

export default function Large($$anchor) {
	Blockquote($$anchor, {
		size: '2xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('"Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to complex dashboard. Perfect choice for your next SaaS application."');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}