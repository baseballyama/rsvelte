import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const derivedConst = ($$anchor) => {
	const x = $.derived(() => 0);
	var p = root();

	p.textContent = $.get(x);
	$.append($$anchor, p);
};

var root = $.from_html(`<p></p>`);

export default function Ts_derived_in_snippet_declaration_tag_input($$anchor) {
	derivedConst($$anchor);
}