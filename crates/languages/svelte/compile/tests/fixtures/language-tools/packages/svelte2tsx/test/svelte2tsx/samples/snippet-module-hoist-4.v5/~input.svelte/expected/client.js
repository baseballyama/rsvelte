import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const hoistable = ($$anchor) => {
	var h1 = root_1();

	$.append($$anchor, h1);
};

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<h1>hoist me</h1>`);

export default function Input($$anchor) {
	const chain = ($$anchor) => {
		var div = root();

		div.textContent = 'true';
		$.append($$anchor, div);
	};

	const chain2 = ($$anchor) => {
		chain($$anchor);
	};

	const chain3 = ($$anchor) => {
		chain2($$anchor);
	};

	let foo = true;
}