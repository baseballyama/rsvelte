import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<my-custom-inheritance-element></my-custom-inheritance-element>`, 2);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

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

	var my_custom_inheritance_element = root();

	$.set_custom_element_data(my_custom_inheritance_element, 'camelCase', { text: 'World' });
	$.set_custom_element_data(my_custom_inheritance_element, 'text', '!');
	$.append($$anchor, my_custom_inheritance_element);
	$.pop();
}