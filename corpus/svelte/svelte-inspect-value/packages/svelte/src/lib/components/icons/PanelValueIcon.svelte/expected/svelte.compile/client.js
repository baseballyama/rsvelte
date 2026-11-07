import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import rotate from '../../transition/rotate.js';
import { useOptions } from '../../options.svelte.js';

var root = $.from_svg(`<path d="M 15.5 9 l 0 6" style="transform-box: fill-box" transform-origin="center"></path>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="square" stroke-linejoin="round" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="2"></rect><path d="M9 3v18"></path><!><path d="M 12.5 12 l 6 0"></path></g></svg>`);

export default function PanelValueIcon($$anchor, $$props) {
	$.push($$props, true);

	let add = $.prop($$props, 'add', 3, true);
	const options = useOptions();
	var svg = root_1();
	var g = $.child(svg);
	var node = $.sibling($.child(g), 2);

	{
		var consequent = ($$anchor) => {
			var path = root();

			$.transition(1, path, () => rotate, () => ({
				rotation: -90,
				duration: options.transitionDuration,
				opacity: 1
			}));

			$.transition(2, path, () => rotate, () => ({
				rotation: 90,
				opacity: 1,
				duration: options.transitionDuration
			}));

			$.append($$anchor, path);
		};

		$.if(node, ($$render) => {
			if (add()) $$render(consequent);
		});
	}

	$.next();
	$.reset(g);
	$.reset(svg);
	$.append($$anchor, svg);
	$.pop();
}