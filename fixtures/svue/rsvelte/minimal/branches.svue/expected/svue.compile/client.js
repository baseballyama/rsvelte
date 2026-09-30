import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h2> </h2>`);
var root_1 = $.from_html(`<h2>Nobody</h2>`);
var root_2 = $.from_html(`<p>open</p>`);
var root_3 = $.from_html(`<section class="card"><!> <button>toggle</button> <!></section>`);

export default function Branches_svue($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []);
	let open = $.state(false);
	var section = root_3();
	var node = $.child(section);

	{
		var consequent = ($$anchor) => {
			var h2 = root();
			var text = $.only_child(h2);

			$.template_effect(() => $.set_text(text, `Hello ${$$props.user.name ?? ''}`));
			$.append($$anchor, h2);
		};

		var consequent_1 = ($$anchor) => {
			var h2_1 = root();
			var text_1 = $.only_child(h2_1);

			$.template_effect(() => $.set_text(text_1, `${items().length ?? ''} items & more`));
			$.append($$anchor, h2_1);
		};

		var alternate = ($$anchor) => {
			var h2_2 = root_1();

			$.append($$anchor, h2_2);
		};

		$.if(node, ($$render) => {
			if ($$props.user) $$render(consequent); else if (items().length > 0) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	var button = $.sibling(node, 2);
	var node_1 = $.sibling(button, 2);

	{
		var consequent_2 = ($$anchor) => {
			var p = root_2();

			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if ($.get(open)) $$render(consequent_2);
		});
	}

	$.reset(section);
	$.template_effect(() => $.set_attribute(section, 'title', $$props.user?.name));
	$.delegated('click', button, () => $.set(open, !$.get(open)));
	$.append($$anchor, section);
	$.pop();
}

$.delegate(['click']);