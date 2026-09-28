import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class MyCustomElement extends HTMLElement {
			constructor() {
				super();
				this._obj = null;
			}

			set camelCase(obj) {
				this._obj = obj;
				this.render();
			}

			connectedCallback() {
				this.render();
			}

			render() {
				this.innerHTML = 'Hello ' + this._obj.text + '!';
			}
		}

		window.customElements.define('my-custom-element', MyCustomElement);
		$$renderer.push(`<my-custom-element${$.attr('camelcase', { text: 'World' })}></my-custom-element>`);
	});
}