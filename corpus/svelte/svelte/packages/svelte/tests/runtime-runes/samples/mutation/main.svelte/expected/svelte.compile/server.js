import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let pending = [];

	function createTogglePending() {
		const id = 1;

		const togglePending = () => {
			if (pending.includes(id)) {
				pending = pending.filter((p) => p !== id);
			} else {
				pending = [...pending, id];
			}
		};

		return { togglePending, id };
	}

	const toggle1 = createTogglePending();

	$$renderer.push(`<button>${$.escape(toggle1.id)} / ${$.escape(pending.includes(toggle1.id))}</button>`);
}