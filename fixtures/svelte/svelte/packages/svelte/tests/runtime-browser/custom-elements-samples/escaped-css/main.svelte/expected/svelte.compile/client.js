import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="icon svelte-l6epgl"></span>`);

const $$css = {
	hash: 'svelte-l6epgl',
	code: '.icon.svelte-l6epgl::before {content:"\\ff";}'
};

export default function Main($$anchor) {
	$.append_styles($$anchor, $$css);

	var span = root();

	$.append($$anchor, span);
}

customElements.define('custom-element', $.create_custom_element(Main, {}, [], [], { mode: 'open' }));