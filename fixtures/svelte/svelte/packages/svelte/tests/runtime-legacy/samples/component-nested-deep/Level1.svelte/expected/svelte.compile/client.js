import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Level2 from './Level2.svelte';
import Level3 from './Level3.svelte';

export default function Level1($$anchor) {
	Level2($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Level3($$anchor, {});
		},
		$$slots: { default: true }
	});
}