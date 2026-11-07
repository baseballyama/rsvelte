import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', '$$host']);

export default function Valid_custom_element_with_props_identifier_input($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);
}

customElements.define('my-component', $.create_custom_element(Valid_custom_element_with_props_identifier_input, {}, [], [], { mode: 'open' }));