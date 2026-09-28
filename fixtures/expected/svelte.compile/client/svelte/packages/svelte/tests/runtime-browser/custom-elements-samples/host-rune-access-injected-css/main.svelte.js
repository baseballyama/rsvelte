import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button class="btn svelte-1nnrbbp">btn</button>`);

const $$css = {
	hash: 'svelte-1nnrbbp',
	code: '.btn.svelte-1nnrbbp {width:123px;height:123px;}'
};

export default function Main($$anchor, $$props) {
	$.push($$props, true);
	$.append_styles($$anchor, $$css);

	$.user_effect(() => {
		$$props.$$host.dispatchEvent(new CustomEvent("html", { detail: $$props.$$host.shadowRoot?.innerHTML }));
	});

	var button = root();

	$.append($$anchor, button);
	$.pop();
}

customElements.define('custom-element', $.create_custom_element(Main, {}, [], [], { mode: 'open' }));