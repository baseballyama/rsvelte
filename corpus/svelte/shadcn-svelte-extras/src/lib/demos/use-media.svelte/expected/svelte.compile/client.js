import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useMedia } from '$lib/hooks/use-media.svelte';
import { scale } from 'svelte/transition';

const breakpoint = ($$anchor, $$arg0) => {
	let name = () => ($$arg0?.()).name;
	var span = root();
	var text = $.only_child(span, true);

	$.template_effect(() => $.set_text(text, name()));
	$.transition(1, span, () => scale, () => ({ duration: 300 }));
	$.append($$anchor, span);
};

var root = $.from_html(`<span class="text-xl"> </span>`);
var root_1 = $.from_html(`<div class="flex flex-col place-items-center gap-2 px-4"><!> <span class="text-muted-foreground text-center text-xs">Resize the window to see the breakpoint change.</span></div>`);

export default function Use_media($$anchor, $$props) {
	$.push($$props, true);

	const media = useMedia();
	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			breakpoint($$anchor, () => ({ name: '2xl' }));
		};

		var consequent_1 = ($$anchor) => {
			breakpoint($$anchor, () => ({ name: 'xl' }));
		};

		var consequent_2 = ($$anchor) => {
			breakpoint($$anchor, () => ({ name: 'lg' }));
		};

		var consequent_3 = ($$anchor) => {
			breakpoint($$anchor, () => ({ name: 'md' }));
		};

		var consequent_4 = ($$anchor) => {
			breakpoint($$anchor, () => ({ name: 'sm' }));
		};

		var alternate = ($$anchor) => {
			breakpoint($$anchor, () => ({ name: '-' }));
		};

		$.if(node, ($$render) => {
			if (media['2xl']) $$render(consequent); else if (media.xl) $$render(consequent_1, 1); else if (media.lg) $$render(consequent_2, 2); else if (media.md) $$render(consequent_3, 3); else if (media.sm) $$render(consequent_4, 4); else $$render(alternate, -1);
		});
	}

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}