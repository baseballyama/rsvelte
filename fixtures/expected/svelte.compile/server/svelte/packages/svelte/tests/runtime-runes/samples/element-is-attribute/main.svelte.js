import * as $ from 'svelte/internal/server';

if (!customElements.get('x-button')) {
	class XButton extends HTMLButtonElement {
		connectedCallback() {
			this.addEventListener('click', () => console.log('works'));
		}
	}

	customElements.define('x-button', XButton, { extends: 'button' });
}

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;

		$$renderer.push(`<button is="x-button">click me</button> <button${$.attributes({ ...props, is: 'x-button' }, void 0, void 0, void 0, 2)}>click me</button>`);
	});
}