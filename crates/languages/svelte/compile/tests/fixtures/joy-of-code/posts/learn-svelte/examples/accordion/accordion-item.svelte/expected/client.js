import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { slide } from 'svelte/transition';

var root = $.from_html(`<div class="accordion-content svelte-sjmdz8"><!></div>`);
var root_1 = $.from_html(`<div class="accordion-item svelte-sjmdz8"><button class="accordion-heading svelte-sjmdz8"><div> </div> <div>👈️</div></button> <!></div>`);

export default function Accordion_item($$anchor, $$props) {
	let open = $.state(false);

	function toggle() {
		$.set(open, !$.get(open));
	}

	var div = root_1();
	var button = $.child(div);
	var div_1 = $.child(button);
	var text = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	let classes;

	$.reset(button);

	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root();
			var node_1 = $.child(div_3);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(div_3);
			$.transition(3, div_3, () => slide);
			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if ($.get(open)) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $$props.title);
		classes = $.set_class(div_2, 1, 'accordion-trigger svelte-sjmdz8', null, classes, { open: $.get(open) });
	});

	$.delegated('click', button, toggle);
	$.append($$anchor, div);
}

$.delegate(['click']);