import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

class Tracking extends HTMLElement {
	static observedAttributes = ["count"];
	tracking = false;

	set count(_) {
		this.tracking = $.effect_tracking();
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

var root = $.from_html(`<button> </button> <my-tracking></my-tracking>`, 3);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var my_tracking = $.sibling(button, 2);

	$.template_effect(() => $.set_custom_element_data(my_tracking, 'count', $.get(count)));
	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', button, () => $.set(count, $.get(count) + 1));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
customElements.define('my-app', $.create_custom_element(Main, {}, [], [], { mode: 'open' }));