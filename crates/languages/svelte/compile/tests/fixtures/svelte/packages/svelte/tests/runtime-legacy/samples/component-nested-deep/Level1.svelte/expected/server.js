import * as $ from 'svelte/internal/server';
import Level2 from './Level2.svelte';
import Level3 from './Level3.svelte';

export default function Level1($$renderer) {
	Level2($$renderer, {
		children: ($$renderer) => {
			Level3($$renderer, {});
		},
		$$slots: { default: true }
	});
}