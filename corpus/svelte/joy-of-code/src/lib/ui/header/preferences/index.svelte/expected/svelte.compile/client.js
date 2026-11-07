import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import { createDropdownMenu, melt } from '@melt-ui/svelte';
import { Cog } from '$lib/icons';
import { sfx } from '$lib/sfx';
import Themes from './themes.svelte';
import Reading from './reading.svelte';
import Dyslexic from './dyslexic.svelte';
import Reset from './reset.svelte';

var root = $.from_html(`<div class="menu svelte-ejy25z"><div></div> <div class="preferences svelte-ejy25z"><span class="title svelte-ejy25z">Preferences</span> <div class="options svelte-ejy25z"><!> <!> <!> <!></div></div></div>`);
var root_1 = $.from_html(`<button aria-label="Preferences"><!></button> <!>`, 1);

export default function Preferences($$anchor, $$props) {
	$.push($$props, true);

	const $trigger = () => $.store_get(trigger, '$trigger', $$stores);
	const $menu = () => $.store_get(menu, '$menu', $$stores);
	const $arrow = () => $.store_get(arrow, '$arrow', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { elements: { trigger, menu, arrow }, states: { open } } = createDropdownMenu({ arrowSize: 16 });
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.child(button);

	Cog(node, { width: 24, height: 24, 'aria-hidden': true });
	$.reset(button);
	$.action(button, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $trigger);

	var node_1 = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);

			$.action(div_1, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $arrow);

			var div_2 = $.sibling(div_1, 2);
			var div_3 = $.sibling($.child(div_2), 2);
			var node_2 = $.child(div_3);

			Themes(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			Reading(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			Dyslexic(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			Reset(node_5, {});
			$.reset(div_3);
			$.reset(div_2);
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