import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<article><h2 class="svelte-3aeeh3"> </h2> <p class="svelte-3aeeh3"> </p></article>`);
var root_1 = $.from_html(`<div><header class="bar svelte-3aeeh3"><h1 class="svelte-3aeeh3">Showcase</h1> <button class="toggle svelte-3aeeh3"> </button></header> <div class="grid svelte-3aeeh3"></div></div>`);

export default function Component($$anchor) {
	let theme = $.state('light');
	let active = $.state(0);
	let pulse = true;

	const cards = [
		{ title: 'Performance', body: 'Compiled, not interpreted.' },
		{ title: 'Reactivity', body: 'Fine-grained by default.' },
		{ title: 'Ergonomics', body: 'Less boilerplate.' }
	];

	var div = root_1();

	$.set_class(div, 1, 'surface svelte-3aeeh3', null, {}, { pulse });

	var header = $.child(div);
	var button = $.sibling($.child(header), 2);
	let styles;
	var text = $.child(button, true);

	$.reset(button);
	$.reset(header);

	var div_1 = $.sibling(header, 2);

	$.each(div_1, 21, () => cards, $.index, ($$anchor, card, i) => {
		var article = root();
		let classes;
		var h2 = $.child(article);
		var text_1 = $.child(h2, true);

		$.reset(h2);

		var p = $.sibling(h2, 2);
		var text_2 = $.child(p, true);

		$.reset(p);
		$.reset(article);

		$.template_effect(() => {
			classes = $.set_class(article, 1, 'card svelte-3aeeh3', null, classes, { selected: $.get(active) === i });
			$.set_text(text_1, $.get(card).title);
			$.set_text(text_2, $.get(card).body);
		});

		$.delegated('click', article, () => $.set(active, i, true));
		$.append($$anchor, article);
	});

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div, 'data-theme', $.get(theme));
		styles = $.set_style(button, '', styles, { '--accent': $.get(theme) === 'light' ? '#2563eb' : '#f59e0b' });
		$.set_text(text, $.get(theme));
	});

	$.delegated('click', button, () => $.set(theme, $.get(theme) === 'light' ? 'dark' : 'light', true));
	$.append($$anchor, div);
}

$.delegate(['click']);
