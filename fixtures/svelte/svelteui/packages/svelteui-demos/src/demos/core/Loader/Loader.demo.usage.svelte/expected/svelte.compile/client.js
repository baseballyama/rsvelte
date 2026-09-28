import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Loader } from '@svelteuidev/core';

const code = `<script>
    import { Loader } from '@svelteuidev/core';
<\/script>

<Loader />`;

export const type = 'demo';
export const configuration = { code };

export default function Loader_demo_usage($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Loader($$anchor, {});
		},
		$$slots: { default: true }
	});
}