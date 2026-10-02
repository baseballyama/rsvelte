import * as $ from 'svelte/internal/server';

export default function Hello_world04_input($$renderer) {
	let count = 0;

	function handleClick() {
		count += 1;
	}

	$$renderer.push(`<button>Clicked ${$.escape(count)} ${$.escape(count === 1 ? 'time' : 'times')}</button>`);
}