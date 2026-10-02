import * as $ from 'svelte/internal/server';

export default function Ignore_no_order_test_output($$renderer) {
	$$renderer.push(`<div order-a="" order-b="" order-c=""></div> <div a="" b="" c=""></div> <div c="" b="" a=""></div> <div h="" g="" f="" e="" order-a="" order-b="" d="" c="" order-c="" b="" a=""></div>`);
}