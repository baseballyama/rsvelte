import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let delegated = 0;
	let non_delegated = 0;

	let attrs = {
		onclick: () => {
			delegated += 1;
		},

		onclickcapture: () => {
			non_delegated += 1;
		}
	};

	$$renderer.push(`<button>change handlers</button> <button>remove capture handler</button> <button${$.attributes({ ...attrs })}>${$.escape(delegated)} / ${$.escape(non_delegated)}</button>`);
}