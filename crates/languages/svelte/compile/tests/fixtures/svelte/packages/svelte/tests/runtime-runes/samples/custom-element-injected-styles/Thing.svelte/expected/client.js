import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1 class="svelte-1wasei8">hello</h1>`);

const $$css = {
	hash: 'svelte-1wasei8',
	code: 'h1.svelte-1wasei8 {color:red;}'
};

export default function Thing($$anchor) {
	$.append_styles($$anchor, $$css);

	var h1 = root();

	$.append($$anchor, h1);
}

customElements.define('my-thing', $.create_custom_element(Thing, {}, [], [], { mode: 'open' }));