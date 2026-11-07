import * as $ from 'svelte/internal/server';

export default function Ignore_no_order_test_input($$renderer) {
	$$renderer.push(`<div order-a="" order-b="" order-c=""></div> <div a="" b="" c=""></div> <div c="" b="" a=""></div> <div h="" g="" order-a="" f="" e="" order-b="" d="" c="" order-c="" b="" a=""></div>`);
}