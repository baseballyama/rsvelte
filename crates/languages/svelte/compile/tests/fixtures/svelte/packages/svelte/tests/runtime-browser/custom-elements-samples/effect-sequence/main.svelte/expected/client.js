import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	$.user_effect(() => {
		$$props.$$host.dispatchEvent(new CustomEvent('change', { bubbles: true }));
	});

	$.pop();
}

customElements.define('child-element', $.create_custom_element(Main, {}, [], [], { mode: 'open' }));