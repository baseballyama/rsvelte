import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const hoistable1 = ($$anchor) => {
	var div = root();

	$.append($$anchor, div);
};

const hoistable2 = ($$anchor) => {
	var div_1 = root_1();

	div_1.textContent = 'true';
	$.append($$anchor, div_1);
};

let foo = true;
var root = $.from_html(`<div>hello</div>`);
var root_1 = $.from_html(`<div></div>`);

export default function Repl($$anchor) {}