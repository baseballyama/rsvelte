import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CustomAccordion from "./accordion-demo-custom.svelte";

export default function Accordion_demo_single($$anchor) {
	const items = [
		{ value: "A", title: "Title A", content: "Content A" },
		{ value: "B", title: "Title B", content: "Content B" },
		{ value: "C", title: "Title C", content: "Content C" }
	];

	CustomAccordion($$anchor, {
		get items() {
			return items;
		},
		type: 'single'
	});
}