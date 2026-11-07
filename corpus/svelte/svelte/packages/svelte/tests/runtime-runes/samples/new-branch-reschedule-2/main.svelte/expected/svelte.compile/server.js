import * as $ from 'svelte/internal/server';

let active = false;
let panelWidth = null;

const store = {
	get active() {
		return active;
	},

	open() {
		active = true;
	},

	close() {
		active = false;
	},

	// This getter lazily writes $state on first read
	get panelWidth() {
		if (panelWidth === null) panelWidth = 42;

		return panelWidth;
	}
};

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let counter = 0;

		$$renderer.push(`<button>Open</button> <button>Close</button> <button>${$.escape(counter)}</button> <div>`);

		if (store.active) {
			$$renderer.push(`<!--[0-->open (width: ${$.escape(store.panelWidth)})`);
		} else {
			$$renderer.push(`<!--[-1-->closed`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}