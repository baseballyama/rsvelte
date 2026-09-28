import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import { createDropdownMenu, melt } from '@melt-ui/svelte';
import { Menu } from '$lib/icons';
import { sfx } from '$lib/sfx';
import * as config from '$lib/site/config';

var root = $.from_html(`<li><a class="svelte-1lw21xf"> </a></li>`);
var root_1 = $.from_html(`<div class="menu svelte-1lw21xf"><div></div> <span class="title svelte-1lw21xf">Categories</span> <ul class="svelte-1lw21xf"></ul></div>`);
var root_2 = $.from_html(`<button aria-label="Categories"><!></button> <!>`, 1);

export default function Menu_1($$anchor, $$props) {
	$.push($$props, true);

	const $trigger = () => $.store_get(trigger, '$trigger', $$stores);
	const $menu = () => $.store_get(menu, '$menu', $$stores);
	const $arrow = () => $.store_get(arrow, '$arrow', $$stores);
	const $item = () => $.store_get(item, '$item', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { elements: { trigger, menu, item, arrow }, states: { open } } = createDropdownMenu({ arrowSize: 16 });
	var fragment = root_2();
	var button = $.first_child(fragment);
	var node = $.child(button);

	Menu(node, { width: 24, height: 24, 'aria-hidden': true });
	$.reset(button);
	$.action(button, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $trigger);

	var node_1 = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var div_1 = $.child(div);

			$.action(div_1, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $arrow);

			var ul = $.sibling(div_1, 4);

			$.each(ul, 21, () => Object.entries(config.categories), $.index, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let slug = () => $.get($$array)[0];
				let category = () => $.get($$array)[1];
				var li = root();
				var a = $.child(li);
				var text = $.only_child(a, true);

				$.reset(li);
				$.action(li, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $item);

				$.template_effect(() => {
					$.set_attribute(a, 'href', `/categories/${slug() ?? ''}`);
					$.set_text(text, category());
				});

				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(div);
			$.action(div, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $menu);
			$.transition(3, div, () => fade, () => ({ duration: 100 }));
			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if (open) $$render(consequent);
		});
	}

	$.delegated('click', button, () => sfx.click());
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);