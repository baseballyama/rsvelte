import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { imported } from './x';

const hoistable1 = ($$anchor) => {
	var div = root();

	$.append($$anchor, div);
};

const hoistable2 = ($$anchor, bar = $.noop) => {
	var div_1 = root_1();
	var text = $.only_child(div_1, true);

	$.template_effect(() => $.set_text(text, bar()));
	$.append($$anchor, div_1);
};

const hoistable3 = ($$anchor, bar = $.noop) => {
	var div_2 = root_1();
	var text_1 = $.only_child(div_2, true);

	$.template_effect(() => $.set_text(text_1, bar()));
	$.append($$anchor, div_2);
};

const hoistable4 = ($$anchor, foo = $.noop) => {
	var div_3 = root_1();
	var text_2 = $.only_child(div_3, true);

	$.template_effect(() => $.set_text(text_2, foo()));
	$.append($$anchor, div_3);
};

const hoistable5 = ($$anchor) => {
	var button = root_2();

	$.delegated('click', button, (e) => e);
	$.append($$anchor, button);
};

const hoistable6 = ($$anchor) => {
	var div_4 = root_3();

	div_4.textContent = 'true';
	$.append($$anchor, div_4);
};

const hoistable7 = ($$anchor) => {
	var div_5 = root_1();
	var text_3 = $.only_child(div_5, true);

	$.template_effect(() => $.set_text(text_3, imported));
	$.append($$anchor, div_5);
};

const hoistable8 = ($$anchor) => {
	var div_6 = root_3();

	div_6.textContent = global;
	$.append($$anchor, div_6);
};

const hoistable9 = ($$anchor, props = $.noop) => {
	$.next();

	var text_4 = $.text('Referencing global types');

	$.append($$anchor, text_4);
};

const hoistable10 = ($$anchor, foo = $.noop) => {
	const bar = $.derived(foo);

	$.next();

	var text_5 = $.text();

	$.template_effect(() => $.set_text(text_5, $.get(bar)));
	$.append($$anchor, text_5);
};

let module = true;
var root = $.from_html(`<div>hello</div>`);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<button>click</button>`);
var root_3 = $.from_html(`<div></div>`);

export default function Input($$anchor) {
	const not_hoistable = ($$anchor) => {
		var div_7 = root_3();

		div_7.textContent = 'true';
		$.append($$anchor, div_7);
	};

	let foo = true;
}

$.delegate(['click']);