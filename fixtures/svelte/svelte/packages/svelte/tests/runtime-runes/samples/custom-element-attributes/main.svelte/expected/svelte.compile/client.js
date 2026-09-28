import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

if (!customElements.get('value-element')) {
	customElements.define('value-element', class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: 'open' });
		}

		set value(v) {
			if (this.__value !== v) {
				this.__value = v;
				this.shadowRoot.innerHTML = `<span>${v}</span>`;
			}
		}
	});
}

if (!customElements.get('value-builtin')) {
	customElements.define(
		'value-builtin',
		class extends HTMLDivElement {
			constructor() {
				super();
				this.attachShadow({ mode: 'open' });
			}

			set value(v) {
				if (this.__value !== v) {
					this.__value = v;
					this.shadowRoot.innerHTML = `<span>${v}</span>`;
				}
			}
		},
		{ extends: 'div' }
	);
}

var root = $.from_html(`<my-element></my-element> <a is="my-link"></a> <value-element></value-element> <value-element></value-element> <div is="value-builtin"></div>`, 3);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var my_element = $.first_child(fragment);

	$.set_custom_element_data(my_element, 'string', 'test');
	$.set_custom_element_data(my_element, 'object', { test: true });

	var a = $.sibling(my_element, 2);

	$.set_custom_element_data(a, 'string', 'test');
	$.set_custom_element_data(a, 'object', { test: true });

	var value_element = $.sibling(a, 2);

	$.set_custom_element_data(value_element, 'value', 'test');

	var value_element_1 = $.sibling(value_element, 2);

	$.attribute_effect(value_element_1, () => ({ ...{ value: "test" } }));

	var div = $.sibling(value_element_1, 2);

	$.set_custom_element_data(div, 'value', 'test');
	$.append($$anchor, fragment);
	$.pop();
}