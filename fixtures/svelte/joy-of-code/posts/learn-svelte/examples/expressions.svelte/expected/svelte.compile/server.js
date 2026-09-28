import * as $ from 'svelte/internal/server';

export default function Expressions($$renderer) {
	let banana = 1;

	$$renderer.push(`<div class="container"><div class="example svelte-8raa54"><button${$.attr('disabled', banana === 0, true)}>-</button> <span class="svelte-8raa54">There's ${$.escape(banana)} ${$.escape(banana === 1 ? 'banana' : 'bananas')} left</span> <button>+</button></div></div>`);
}