import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

export default function Right($$anchor) {
	P($$anchor, {
		align: 'right',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Get started with an enterprise-level, profesionally designed, fully responsive, and HTML semantic set of web pages, sections and over 400+ components crafted with the utility classes from Tailwind\n  CSS and based on the Flowbite component library');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}