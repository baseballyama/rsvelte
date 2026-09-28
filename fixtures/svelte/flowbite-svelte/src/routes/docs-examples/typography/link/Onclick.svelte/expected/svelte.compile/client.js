import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { A } from "flowbite-svelte";

export default function Onclick($$anchor) {
	const myaction = () => {
		console.log("Action triggered");
	};

	A($$anchor, {
		href: '/',
		onclick: myaction,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Read more');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}