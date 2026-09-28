import * as $ from 'svelte/internal/server';

if (!customElements.get('my-custom-element')) {
	customElements.define('my-custom-element', class extends HTMLElement {
		connectedCallback() {
			this.attachShadow({ mode: 'open' });
			this.shadowRoot.innerHTML = '|<slot></slot>|<slot name="slot"></slot>|';
		}
	});
}

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children } = $$props;

		$$renderer.push(`<my-custom-element>`);
		children($$renderer);
		$$renderer.push(`<!----></my-custom-element>`);
	});
}