import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { sleep } from '$lib/utils/sleep';

export default function Button_on_click_promise($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		async function work() {
			await sleep(1000);
		}

		Button($$renderer, {
			onClickPromise: work,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Save`);
			},
			$$slots: { default: true }
		});
	});
}