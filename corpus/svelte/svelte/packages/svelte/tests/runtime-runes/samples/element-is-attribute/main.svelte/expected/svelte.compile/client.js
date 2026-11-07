import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

if (!customElements.get('x-button')) {
	class XButton extends HTMLButtonElement {
		connectedCallback() {
			this.addEventListener('click', () => console.log('works'));
		}
	}

	customElements.define('x-button', XButton, { extends: 'button' });
}

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<button is="x-button">click me</button> <button is="x-button">click me</button>`, 3);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);

	$.attribute_effect(button_1, () => ({ ...props }));
	$.append($$anchor, fragment);
	$.pop();
}