import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TAILWIND_BREAKPOINTS, useMedia } from '$lib/hooks/use-media.svelte';
import { scale } from 'svelte/transition';

var root = $.from_html(`<span class="text-xl">custom</span>`);
var root_1 = $.from_html(`<span class="text-xl">-</span>`);
var root_2 = $.from_html(`<div class="flex flex-col place-items-center gap-2 px-4"><!> <span class="text-muted-foreground text-center text-xs">Resize the window to see the breakpoint change at 500px.</span></div>`);

export default function Use_media_custom($$anchor, $$props) {
	$.push($$props, true);

	const media = useMedia({ ...TAILWIND_BREAKPOINTS, custom: '500px' });
	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.transition(1, span, () => scale, () => ({ duration: 300 }));
			$.append($$anchor, span);
		};

		var alternate = ($$anchor) => {
			var span_1 = root_1();

			$.transition(1, span_1, () => scale, () => ({ duration: 300 }));
			$.append($$anchor, span_1);
		};

		$.if(node, ($$render) => {
			if (media.custom) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}