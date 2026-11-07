import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { backIn, backOut } from 'svelte/easing';
import { useOptions } from '../../options.svelte.js';
import rotate from '../../transition/rotate.js';

var root = $.from_svg(`<path d="M 10 11 l 0 6" style="transform-box: fill-box" transform-origin="center"></path>`);

var root_1 = $.from_svg(`<svg viewBox="0 0 24 24" stroke-linecap="square" stroke-linejoin="round"><g fill="currentColor" stroke-width="2" stroke="currentColor"><!><path d="M 7 14 l 6 0" style="transform-box: fill-box" transform-origin="center"></path><path fill="none" d="
        M 2, 20
        l 0 -12
        a 2 2 0 0 1 2 -2
        h 12
        a 2 2 0 0 1 2 2
        v 12
        a 2 2 0 0 1 -2 2
        h -12
        a 2 2 0 0 1 -2 -2
        z"></path><path fill="none" d="
        M 6, 6
        l 0 -2
        a 2 2 0 0 1 2 -2
        h 12
        a 2 2 0 0 1 2 2
        v 12
        a 2 2 0 0 1 -2 2"></path></g></svg>`);

export default function ExpandCollapseIcon($$anchor, $$props) {
	$.push($$props, true);

	const options = useOptions();
	var svg = root_1();
	var g = $.child(svg);
	var node = $.child(g);

	{
		var consequent = ($$anchor) => {
			var path = root();

			$.transition(1, path, () => rotate, () => ({
				rotation: 360,
				duration: options.transitionDuration * 3,
				easing: backOut
			}));

			$.transition(2, path, () => rotate, () => ({
				rotation: 360,
				duration: options.transitionDuration * 3,
				easing: backIn
			}));

			$.append($$anchor, path);
		};

		$.if(node, ($$render) => {
			if ($$props.expand) $$render(consequent);
		});
	}

	var path_1 = $.sibling(node);

	$.next(2);
	$.reset(g);
	$.reset(svg);
	$.template_effect(() => $.set_class(path_1, 0, $.clsx(['minus', $$props.setting]), 'svelte-1wz86od'));
	$.append($$anchor, svg);
	$.pop();
}