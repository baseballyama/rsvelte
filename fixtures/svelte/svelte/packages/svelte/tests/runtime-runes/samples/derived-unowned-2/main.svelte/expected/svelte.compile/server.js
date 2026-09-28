import * as $ from 'svelte/internal/server';
import { s } from "./Component.svelte";
import { onMount } from "svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let d2 = $.derived(() => s.d1.filter((x) => x > 2));
		let d3 = $.derived(() => s.all.filter((x) => x > 2));

		onMount(() => {
			queueMicrotask(() => {
				s.update_value();
			});
		});

		$$renderer.push(`<div>d2: ${$.escape(d2().join(','))}</div> <div>d3: ${$.escape(d3().join(','))}</div> <div>d4: ${$.escape(d3().join(','))}</div>`);
	});
}