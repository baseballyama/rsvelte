import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { Progress } from "$lib/registry/ui/progress/index.js";

export default function Progress_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = 13;

		onMount(() => {
			const timer = setTimeout(() => value = 66, 500);

			return () => clearTimeout(timer);
		});

		Progress($$renderer, { value, max: 100, class: 'w-[60%]' });
	});
}