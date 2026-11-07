import * as $ from 'svelte/internal/server';

export default function Alphabetical_test_output($$renderer) {
	$$renderer.push(`<div b-foo="" a-foo="" c-foo=""></div> <div a-b="" a-a="" a-c=""></div> <div b-c="" b-b="" b-a=""></div> <div c-b="" c-c="" c-a=""></div>`);
}