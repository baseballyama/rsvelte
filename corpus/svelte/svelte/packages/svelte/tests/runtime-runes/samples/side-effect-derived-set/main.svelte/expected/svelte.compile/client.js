import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from 'svelte/reactivity';

var root = $.from_html(`<button>external</button> <!> <button>internal</button> <!> <button>external</button> <!> <button>internal</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let outside_basic = $.state(false);
	let outside_basic_set = new SvelteSet();

	const throws_basic = $.derived(() => {
		outside_basic_set.add(1);

		return outside_basic_set;
	});

	let inside_basic = $.state(false);

	const works_basic = $.derived(() => {
		let internal = new SvelteSet();

		internal.add(1);

		return internal;
	});

	let outside_has_delete = $.state(false);
	let outside_has_delete_set = new SvelteSet([1]);

	const throws_has_delete = $.derived(() => {
		outside_has_delete_set.has(1);
		outside_has_delete_set.delete(1);

		return outside_has_delete_set;
	});

	let inside_has_delete = $.state(false);

	const works_has_delete = $.derived(() => {
		let internal = new SvelteSet([1]);

		internal.has(1);
		internal.delete(1);

		return internal;
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(throws_basic)));
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

			$.template_effect(() => $.set_text(text_2, $.get(throws_has_delete)));
			$.append($$anchor, text_2);
		};

		$.if(node_2, ($$render) => {
			if ($.get(outside_has_delete)) $$render(consequent_2);
		});
	}

	var button_3 = $.sibling(node_2, 2);
	var node_3 = $.sibling(button_3, 2);

	{
		var consequent_3 = ($$anchor) => {
			var text_3 = $.text();

			$.template_effect(() => $.set_text(text_3, $.get(works_has_delete)));
			$.append($$anchor, text_3);
		};

		$.if(node_3, ($$render) => {
			if ($.get(inside_has_delete)) $$render(consequent_3);
		});
	}

	$.delegated('click', button, () => $.set(outside_basic, true));
	$.delegated('click', button_1, () => $.set(inside_basic, true));
	$.delegated('click', button_2, () => $.set(outside_has_delete, true));
	$.delegated('click', button_3, () => $.set(inside_has_delete, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);