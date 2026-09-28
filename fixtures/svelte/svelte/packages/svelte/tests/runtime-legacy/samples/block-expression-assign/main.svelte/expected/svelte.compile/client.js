import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const snip = ($$anchor) => {};
var root = $.from_html(`<!> <!> <!> <!> <!> <!> <div></div> <!> <!> <button>inc</button> `, 1);

export default function Main($$anchor) {
	let a = 0;
	let b = 0;
	let c = 0;
	let d = 0;
	let e = 0;
	let f = 0;
	let g = 0;
	let h = 0;
	let i = 0;

	function inc() {
		a++;
		b++;
		c++;
		d++;
		e++;
		f++;
		g++;
		h++;
		i++;
	}

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {};

		$.if(node, ($$render) => {
			if (a = 0) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => [b = 0], $.index, ($$anchor, x) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, ($.get(x), '')));
		$.append($$anchor, text);
	});

	var node_2 = $.sibling(node_1, 2);

	$.key(node_2, () => c = 0, ($$anchor) => {});

	var node_3 = $.sibling(node_2, 2);

	$.await(node_3, () => d = 0, ($$anchor) => {});

	var node_4 = $.sibling(node_3, 2);

	$.snippet(node_4, () => (e = 0, snip));

	var node_5 = $.sibling(node_4, 2);

	$.html(node_5, () => (f = 0, ''));

	var div = $.sibling(node_5, 2);

	$.attach(div, () => !!(g = 0));

	var node_6 = $.sibling(div, 2);

	$.key(node_6, () => 1, ($$anchor) => {
		const x = $.derived(() => h = 0);
		var text_1 = $.text();

		$.template_effect(() => $.set_text(text_1, ($.get(x), '')));
		$.append($$anchor, text_1);
	});

	var node_7 = $.sibling(node_6, 2);

	{
		var consequent_1 = ($$anchor) => {
			const x = $.derived(() => i = 0);
			var text_2 = $.text();

			$.template_effect(() => $.set_text(text_2, ($.get(x), '')));
			$.append($$anchor, text_2);
		};

		$.if(node_7, ($$render) => {
			if (1) $$render(consequent_1);
		});
	}

	var button = $.sibling(node_7, 2);
	var text_3 = $.sibling(button);

	$.template_effect(() => $.set_text(text_3, ` [${a ?? ''},${b ?? ''},${c ?? ''},${d ?? ''},${e ?? ''},${f ?? ''},${g ?? ''},${h ?? ''},${i ?? ''}]`));
	$.event('click', button, inc);
	$.append($$anchor, fragment);
}