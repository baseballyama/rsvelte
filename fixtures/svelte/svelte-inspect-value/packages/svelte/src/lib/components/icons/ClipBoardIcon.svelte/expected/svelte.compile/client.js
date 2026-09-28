import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { draw } from 'svelte/transition';
import { useOptions } from '../../options.svelte.js';

var root = $.from_svg(`<path d="m9 14l2 2l4-4"></path>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><!></g></svg>`);

export default function ClipBoardIcon($$anchor, $$props) {
	$.push($$props, true);

	let copied = $.prop($$props, 'copied', 3, false);
	const options = useOptions();
	var svg = root_1();
	var g = $.child(svg);
	var node = $.sibling($.child(g), 2);

	{
		var consequent = ($$anchor) => {
			var path = root();

			$.transition(3, path, () => draw, () => ({ duration: options?.transitionDuration ?? 0 }));
			$.append($$anchor, path);
		};

		$.if(node, ($$render) => {
			if (copied()) $$render(consequent);
		});
	}

	$.reset(g);
	$.reset(svg);
	$.append($$anchor, svg);
	$.pop();
}