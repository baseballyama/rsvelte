import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const dynamic_value = 'bar';

	$$renderer.push(`<div class="bar baz svelte-1iut2mq">bar</div> <div class="foo bar baz svelte-1iut2mq">bar</div>`);
}