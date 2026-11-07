import * as $ from 'svelte/internal/server';

class Tracking extends HTMLElement {
	static observedAttributes = ["count"];
	tracking = false;

	set count(_) {
		this.tracking = false;
		this.render();
	}

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	render() {
		this.shadowRoot.innerHTML = `<p>${this.tracking}</p>`;
	}
}

customElements.define("my-tracking", Tracking);

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		$$renderer.push(`<button>${$.escape(count)}</button> <my-tracking${$.attr('count', count)}></my-tracking>`);
	});
}