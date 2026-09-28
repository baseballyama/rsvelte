import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArrowRight, PencilSquare, Heart } from '$lib/icons';

var root = $.from_html(`<div class="card svelte-ssx89u"><div class="decorative svelte-ssx89u"><!></div> <span class="title svelte-ssx89u">Support</span> <p class="text svelte-ssx89u">You can support my work on Patreon.</p> <a class="link svelte-ssx89u" href="https://www.patreon.com/joyofcode" target="_blank" rel="noreferrer"><span>Patreon</span> <!></a></div>`);

var root_1 = $.from_html(`<div class="card svelte-ssx89u"><div class="decorative svelte-ssx89u"><!></div> <span class="title svelte-ssx89u">Found a mistake?</span> <p class="text svelte-ssx89u">Every post is a Markdown file so contributing is simple as following the
			link below and pressing the pencil icon inside GitHub to edit it.</p> <a class="link svelte-ssx89u" target="_blank" rel="noreferrer"><span>Edit on GitHub</span> <!></a></div>`);

var root_2 = $.from_html(`<!> <!>`, 1);

export default function Card($$anchor, $$props) {
	let editUrl = $.prop($$props, 'editUrl', 3, '');
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var node_1 = $.child(div_1);

			Heart(node_1, { width: 24, height: 24, 'aria-hidden': true });
			$.reset(div_1);

			var a = $.sibling(div_1, 6);
			var node_2 = $.sibling($.child(a), 2);

			ArrowRight(node_2, { width: 24, height: 24, 'aria-hidden': true });
			$.reset(a);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.preset === 'support') $$render(consequent);
		});
	}

	var node_3 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();
			var div_3 = $.child(div_2);
			var node_4 = $.child(div_3);

			PencilSquare(node_4, { width: 24, height: 24, 'aria-hidden': true });
			$.reset(div_3);

			var a_1 = $.sibling(div_3, 6);
			var node_5 = $.sibling($.child(a_1), 2);

			ArrowRight(node_5, { width: 24, height: 24, 'aria-hidden': true });
			$.reset(a_1);
			$.reset(div_2);
			$.template_effect(() => $.set_attribute(a_1, 'href', editUrl()));
			$.append($$anchor, div_2);
		};

		$.if(node_3, ($$render) => {
			if ($$props.preset === 'edit') $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
}