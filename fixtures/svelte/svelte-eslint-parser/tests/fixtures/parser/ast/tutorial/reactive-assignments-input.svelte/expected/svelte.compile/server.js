import * as $ from 'svelte/internal/server';

export default function Reactive_assignments_input($$renderer) {
	let count = 0;

	function handleClick() {
		// event handler code goes here
		count += 1;
	}

	$$renderer.push(`<button>Clicked ${$.escape(count)} ${$.escape(count === 1 ? 'time' : 'times')}</button>`);
}