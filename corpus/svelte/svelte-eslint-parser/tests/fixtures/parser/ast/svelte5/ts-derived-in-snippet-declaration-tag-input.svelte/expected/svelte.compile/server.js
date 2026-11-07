import * as $ from 'svelte/internal/server';

function derivedConst($$renderer) {
	const x = $.derived(() => 0);

	$$renderer.push(`<p>0</p>`);
}

export default function Ts_derived_in_snippet_declaration_tag_input($$renderer) {
	derivedConst($$renderer);
}