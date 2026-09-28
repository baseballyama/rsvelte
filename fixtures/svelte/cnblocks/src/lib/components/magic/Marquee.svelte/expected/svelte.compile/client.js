import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function Marquee($$anchor, $$props) {
	$.push($$props, true);

	let pauseOnHover = $.prop($$props, 'pauseOnHover', 3, false),
		vertical = $.prop($$props, 'vertical', 3, false),
		repeat = $.prop($$props, 'repeat', 3, 4),
		reverse = $.prop($$props, 'reverse', 3, false),
		_class = $.prop($$props, 'class', 3, "");

	var div = root_1();

	$.each(div, 21, () => ({ length: repeat() }), $.index, ($$anchor, _) => {
		var div_1 = root();
		var node = $.child(div_1);

		$.snippet(node, () => $$props.children ?? $.noop);
		$.reset(div_1);

		$.template_effect(
			($0) => {
				$.set_class(div_1, 1, $0, 'svelte-duxolg');

				$.set_style(div_1, `animation-direction:${reverse() ? 'reverse' : 'normal'};
      `);
			},
			[
				() => $.clsx(cn("flex shrink-0 justify-around gap-(--gap)", {
					"animate-marquee flex-row": !vertical(),
					"animate-marquee-vertical flex-col": vertical(),
					"group-hover:paused": pauseOnHover()
				}))
			]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0, 'svelte-duxolg'), [
		() => $.clsx(cn("group flex gap-(--gap) overflow-hidden p-2 [--duration:16s] [--gap:3rem]", { "flex-row": !vertical(), "flex-col": vertical() }, _class()))
	]);

	$.append($$anchor, div);
	$.pop();
}