import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteMap } from 'svelte/reactivity';

var root = $.from_html(`<button>external</button> <!> <button>internal</button> <!> <button>external</button> <!> <button>internal</button> <!> <button>external</button> <!> <button>internal</button> <!> <button>external</button> <!> <button>internal</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let outside_basic = $.state(false);
	let outside_basic_map = new SvelteMap();

	const throw_basic = $.derived(() => {
		outside_basic_map.set(1, 1);

		return outside_basic_map;
	});

	let inside_basic = $.state(false);

	const works_basic = $.derived(() => {
		let inside = new SvelteMap();

		inside.set(1, 1);

		return inside;
	});

	let outside_has = $.state(false);
	let outside_has_map = new SvelteMap([[1, 1]]);

	const throw_has = $.derived(() => {
		outside_has_map.has(1);
		outside_has_map.set(1, 2);

		return outside_has_map;
	});

	let inside_has = $.state(false);

	const works_has = $.derived(() => {
		let inside = new SvelteMap([[1, 1]]);

		inside.has(1);
		inside.set(1, 1);

		return inside;
	});

	let outside_get = $.state(false);
	let outside_get_map = new SvelteMap([[1, 1]]);

	const throw_get = $.derived(() => {
		outside_get_map.get(1);
		outside_get_map.set(1, 2);

		return outside_get_map;
	});

	let inside_get = $.state(false);

	const works_get = $.derived(() => {
		let inside = new SvelteMap([[1, 1]]);

		inside.get(1);
		inside.set(1, 1);

		return inside;
	});

	let outside_values = $.state(false);
	let outside_values_map = new SvelteMap([[1, 1]]);

	const throw_values = $.derived(() => {
		outside_values_map.values(1);
		outside_values_map.set(1, 2);

		return outside_values_map;
	});

	let inside_values = $.state(false);

	const works_values = $.derived(() => {
		let inside = new SvelteMap([[1, 1]]);

		inside.values();
		inside.set(1, 1);

		return inside;
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(throw_basic)));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if ($.get(outside_basic)) $$render(consequent);
		});
	}

	var button_1 = $.sibling(node, 2);
	var node_1 = $.sibling(button_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $.get(works_basic)));
			$.append($$anchor, text_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(inside_basic)) $$render(consequent_1);
		});
	}

	var button_2 = $.sibling(node_1, 2);
	var node_2 = $.sibling(button_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var text_2 = $.text();

			$.template_effect(() => $.set_text(text_2, $.get(throw_has)));
			$.append($$anchor, text_2);
		};

		$.if(node_2, ($$render) => {
			if ($.get(outside_has)) $$render(consequent_2);
		});
	}

	var button_3 = $.sibling(node_2, 2);
	var node_3 = $.sibling(button_3, 2);

	{
		var consequent_3 = ($$anchor) => {
			var text_3 = $.text();

			$.template_effect(() => $.set_text(text_3, $.get(works_has)));
			$.append($$anchor, text_3);
		};

		$.if(node_3, ($$render) => {
			if ($.get(inside_has)) $$render(consequent_3);
		});
	}

	var button_4 = $.sibling(node_3, 2);
	var node_4 = $.sibling(button_4, 2);

	{
		var consequent_4 = ($$anchor) => {
			var text_4 = $.text();

			$.template_effect(() => $.set_text(text_4, $.get(throw_get)));
			$.append($$anchor, text_4);
		};

		$.if(node_4, ($$render) => {
			if ($.get(outside_get)) $$render(consequent_4);
		});
	}

	var button_5 = $.sibling(node_4, 2);
	var node_5 = $.sibling(button_5, 2);

	{
		var consequent_5 = ($$anchor) => {
			var text_5 = $.text();

			$.template_effect(() => $.set_text(text_5, $.get(works_get)));
			$.append($$anchor, text_5);
		};

		$.if(node_5, ($$render) => {
			if ($.get(inside_get)) $$render(consequent_5);
		});
	}

	var button_6 = $.sibling(node_5, 2);
	var node_6 = $.sibling(button_6, 2);

	{
		var consequent_6 = ($$anchor) => {
			var text_6 = $.text();

			$.template_effect(() => $.set_text(text_6, $.get(throw_values)));
			$.append($$anchor, text_6);
		};

		$.if(node_6, ($$render) => {
			if ($.get(outside_values)) $$render(consequent_6);
		});
	}

	var button_7 = $.sibling(node_6, 2);
	var node_7 = $.sibling(button_7, 2);

	{
		var consequent_7 = ($$anchor) => {
			var text_7 = $.text();

			$.template_effect(() => $.set_text(text_7, $.get(works_values)));
			$.append($$anchor, text_7);
		};

		$.if(node_7, ($$render) => {
			if ($.get(inside_values)) $$render(consequent_7);
		});
	}

	$.delegated('click', button, () => $.set(outside_basic, true));
	$.delegated('click', button_1, () => $.set(inside_basic, true));
	$.delegated('click', button_2, () => $.set(outside_has, true));
	$.delegated('click', button_3, () => $.set(inside_has, true));
	$.delegated('click', button_4, () => $.set(outside_get, true));
	$.delegated('click', button_5, () => $.set(inside_get, true));
	$.delegated('click', button_6, () => $.set(outside_values, true));
	$.delegated('click', button_7, () => $.set(inside_values, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);