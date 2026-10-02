import * as $ from 'svelte/internal/server';

export default function Ignore_no_order_test_input($$renderer) {
	$$renderer.push(`<div order-b="" order-c="" order-a=""></div> <div a="" b="" c=""></div> <div c="" b="" a=""></div> <div h="" g="" f="" e="" order-b="" d="" order-a="" c="" order-c="" b="" a=""></div>`);
}