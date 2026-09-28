import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Sub from './sub.svelte';
import { onMount } from 'svelte';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = 0;
	let component;

	onMount(() => {
		component.$on('increment', (e) => {
			count += e.detail;
			component.$set({ count });
		});
	});

	$.bind_this(Sub($$anchor, {}), ($$value) => component = $$value, () => component);
	$.pop();
}