import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import white_grit from '$assets/whitegrit.png';
import { fly } from 'svelte/transition';

var root = $.from_html(`<div id="menu" class="menu svelte-1d8gtus"><button class="button-reset close-button svelte-1d8gtus">×</button> <nav class="svelte-1d8gtus"><a href="/shows" class="svelte-1d8gtus">Shows</a> <a href="/videos" class="svelte-1d8gtus">Video</a> <a href="/snackpack" class="svelte-1d8gtus">Newsletter</a> <a href="/about" class="svelte-1d8gtus">About</a> <a href="/potluck" class="svelte-1d8gtus">Potluck Qs</a> <a target="_blank" href="https://sentry.shop" class="svelte-1d8gtus">Swag</a></nav></div>`);
var root_1 = $.from_html(`<div class="mobile_nav svelte-1d8gtus"><button class="button-reset svelte-1d8gtus">Menu</button> <!></div>`);

export default function MobileNav($$anchor) {
	let is_active = $.state(false);

	function toggle() {
		return $.set(is_active, !$.get(is_active));
	}

	var div = root_1();
	var button = $.child(div);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var button_1 = $.child(div_1);
			var nav = $.sibling(button_1, 2);
			var a = $.child(nav);
			var a_1 = $.sibling(a, 2);
			var a_2 = $.sibling(a_1, 2);
			var a_3 = $.sibling(a_2, 2);
			var a_4 = $.sibling(a_3, 2);
			var a_5 = $.sibling(a_4, 2);

			$.reset(nav);
			$.reset(div_1);
			$.template_effect(() => $.set_style(div_1, `background-image:  url(${white_grit ?? ''}); background-size: 300px;`));
			$.delegated('click', button_1, toggle);
			$.delegated('click', a, toggle);
			$.delegated('click', a_1, toggle);
			$.delegated('click', a_2, toggle);
			$.delegated('click', a_3, toggle);
			$.delegated('click', a_4, toggle);
			$.delegated('click', a_5, toggle);
			$.transition(3, div_1, () => fly, () => ({ opacity: 0, x: '100%' }));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(is_active)) $$render(consequent);
		});
	}

	$.reset(div);
	$.delegated('click', button, toggle);
	$.append($$anchor, div);
}

$.delegate(['click']);