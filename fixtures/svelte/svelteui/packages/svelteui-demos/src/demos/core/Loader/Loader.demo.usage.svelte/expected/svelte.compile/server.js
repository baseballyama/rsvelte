import * as $ from 'svelte/internal/server';
import { Center, Loader } from '@svelteuidev/core';

const code = `<script>
    import { Loader } from '@svelteuidev/core';
<\/script>

<Loader />`;

export const type = 'demo';
export const configuration = { code };

export default function Loader_demo_usage($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Loader($$renderer, {});
		},
		$$slots: { default: true }
	});
}