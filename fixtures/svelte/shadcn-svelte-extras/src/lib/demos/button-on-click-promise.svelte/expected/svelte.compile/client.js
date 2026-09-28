import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import { sleep } from '$lib/utils/sleep';

export default function Button_on_click_promise($$anchor, $$props) {
	$.push($$props, true);

	async function work() {
		await sleep(1000);
	}

	Button($$anchor, {
		onClickPromise: work,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Save');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.pop();
}