import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class MyCustomElement extends HTMLElement {
			constructor() {
				super();
				this._obj = null;
				this._text = null;
			}

			set text(text) {
				this._text = text;
				this.render();
			}

			set camelCase(obj) {
				this._obj = obj;
				this.render();
			}

			connectedCallback() {
				this.render();
			}

			render() {
				this.innerHTML = 'Hello ' + this._obj.text + this._text;
			}
		}

		class Extended extends MyCustomElement {}

		window.customElements.define('my-custom-inheritance-element', Extended);
		$$renderer.push(`<my-custom-inheritance-element${$.attr('camelcase', { text: 'World' })} text="!"></my-custom-inheritance-element>`);
	});
}