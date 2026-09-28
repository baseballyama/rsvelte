import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

if (!customElements.get('my-custom-element')) {
	customElements.define('my-custom-element', class extends HTMLElement {
		connectedCallback() {
			this.attachShadow({ mode: 'open' });
			this.shadowRoot.innerHTML = '|<slot></slot>|<slot name="slot"></slot>|';
		}
	});
}

var root = $.from_html(`<my-custom-element><!></my-custom-element>`, 2);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	var my_custom_element = root();
	var node = $.child(my_custom_element);

	$.snippet(node, () => $$props.children);
	$.reset(my_custom_element);
	$.append($$anchor, my_custom_element);
	$.pop();
}