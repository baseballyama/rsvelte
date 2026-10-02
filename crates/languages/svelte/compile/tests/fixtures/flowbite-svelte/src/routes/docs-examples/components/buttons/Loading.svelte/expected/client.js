import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "flowbite-svelte";

export default function Loading($$anchor, $$props) {
	$.push($$props, true);

	let loading = $.state(false);

	async function handleSubmit() {
		$.set(loading, true);
		await new Promise((resolve) => setTimeout(resolve, 2000));
		$.set(loading, false);
	}

	Button($$anchor, {
		class: 'w-32',
		onclick: handleSubmit,
		get loading() {
			return $.get(loading);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Submit');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.pop();
}