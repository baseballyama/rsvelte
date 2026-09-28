import * as $ from 'svelte/internal/server';
import CustomAccordion from "./accordion-demo-custom.svelte";

export default function Accordion_demo_single($$renderer) {
	const items = [
		{ value: "A", title: "Title A", content: "Content A" },
		{ value: "B", title: "Title B", content: "Content B" },
		{ value: "C", title: "Title C", content: "Content C" }
	];

	CustomAccordion($$renderer, { items, type: 'single' });
}