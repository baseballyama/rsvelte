import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-qqnkxm">styled</p>`);
const $$css = { hash: 'svelte-qqnkxm', code: 'p.svelte-qqnkxm {color:red;}' };

export default function Main($$anchor) {
	$.append_styles($$anchor, $$css);

	var p = root();

	$.append($$anchor, p);
}

customElements.define('custom-element', $.create_custom_element(Main, {}, [], [], { mode: 'open' }));