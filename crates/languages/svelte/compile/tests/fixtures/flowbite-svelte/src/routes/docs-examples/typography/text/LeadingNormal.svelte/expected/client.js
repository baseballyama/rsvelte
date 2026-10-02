import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { P } from "flowbite-svelte";

export default function LeadingNormal($$anchor) {
	P($$anchor, {
		size: '3xl',
		height: 'normal',
		class: 'max-w-lg',
		weight: 'semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('The Al-powered app will help you improve yourself by analysing your everyday life.');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}