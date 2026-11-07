import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`);
var root_2 = $.from_html(`<button><!></button>`);

export default function BurgerIcon($$anchor, $$props) {
	$.push($$props, true);

	let showMenu = $.prop($$props, 'showMenu', 15, false);
	let text = $.derived(() => showMenu() ? 'Hide' : 'Show');
	var button = root_2();
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var svg = root();

			$.append($$anchor, svg);
		};

		var alternate = ($$anchor) => {
			var svg_1 = root_1();

			$.append($$anchor, svg_1);
		};

		$.if(node, ($$render) => {
			if (showMenu()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-label', `${$.get(text) ?? ''} navigation menu`);
		$.set_attribute(button, 'aria-expanded', showMenu());
	});

	$.delegated('click', button, () => showMenu(!showMenu()));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);