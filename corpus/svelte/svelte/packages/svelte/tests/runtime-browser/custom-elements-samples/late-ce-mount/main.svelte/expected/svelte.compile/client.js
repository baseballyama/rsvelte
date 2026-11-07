import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<set-property-before-mounted></set-property-before-mounted>`, 2);
var root_1 = $.from_html(`<button>Update</button> <set-property-before-mounted></set-property-before-mounted> <!>`, 3);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class CustomElement extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: 'open' });

			Object.defineProperty(this, 'property', {
				set: (value) => {
					this.shadowRoot.innerHTML = typeof value + '|' + JSON.stringify(value);
				}
			});
		}
	}

	onMount(async () => {
		customElements.define('set-property-before-mounted', CustomElement);
	});

	let property = $.state(void 0);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var set_property_before_mounted = $.sibling(button, 2);

	$.template_effect(() => $.set_custom_element_data(set_property_before_mounted, 'property', $.get(property)));

	var node = $.sibling(set_property_before_mounted, 2);

	{
		var consequent = ($$anchor) => {
			var set_property_before_mounted_1 = root();

			$.template_effect(() => $.set_custom_element_data(set_property_before_mounted_1, 'property', $.get(property)));
			$.append($$anchor, set_property_before_mounted_1);
		};

		$.if(node, ($$render) => {
			if ($.get(property)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(property, { foo: 'bar' }, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
customElements.define('custom-element', $.create_custom_element(Main, {}, [], [], { mode: 'open' }));