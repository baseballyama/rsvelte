import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let current = { active: false };
	let count = 0;

	function toggle() {
		if (current.active = !current.active) {
			count += 1;
		}
	}

	$$renderer.push(`<button>${$.escape(current.active)} ${$.escape(count)}</button>`);
}