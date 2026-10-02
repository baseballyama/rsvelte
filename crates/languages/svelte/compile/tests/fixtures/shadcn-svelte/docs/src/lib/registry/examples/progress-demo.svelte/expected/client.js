import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { Progress } from "$lib/registry/ui/progress/index.js";

export default function Progress_demo($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(13);

	onMount(() => {
		const timer = setTimeout(() => $.set(value, 66), 500);

		return () => clearTimeout(timer);
	});

	Progress($$anchor, {
		get value() {
			return $.get(value);
		},
		max: 100,
		class: 'w-[60%]'
	});

	$.pop();
}