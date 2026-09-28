import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>say hello</button> <button>say welcome</button> <button>say bonjour</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	function greet(greeting) {
		$$props.$$host.dispatchEvent(new CustomEvent('greeting', { detail: greeting }));
	}

	function welcome() {
		$$props.$$host.dispatchEvent(new CustomEvent('greeting', { detail: 'welcome' }));
	}

	function bonjour() {
		const element = $$props.$$host;

		element.dispatchEvent(new CustomEvent('greeting', { detail: 'bonjour' }));
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);

	$.delegated('click', button, () => greet('hello'));
	$.delegated('click', button_1, welcome);
	$.delegated('click', button_2, bonjour);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
customElements.define('custom-element', $.create_custom_element(Main, {}, [], [], { mode: 'open' }));