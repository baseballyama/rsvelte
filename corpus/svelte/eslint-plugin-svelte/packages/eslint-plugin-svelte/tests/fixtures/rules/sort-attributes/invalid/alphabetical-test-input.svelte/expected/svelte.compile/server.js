import * as $ from 'svelte/internal/server';

export default function Alphabetical_test_input($$renderer) {
	$$renderer.push(`<div a-foo="" b-foo="" c-foo=""></div> <div a-b="" a-a="" a-c=""></div> <div b-c="" b-b="" b-a=""></div> <div c-c="" c-b="" c-a=""></div>`);
}