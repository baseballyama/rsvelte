import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { movable } from '@svelte-put/movable';
import { onMount } from 'svelte';

var root = $.from_html(`<p class="to-ignore hl-error cursor-auto p-2 text-sm">To ignore</p>`);
var root_1 = $.from_html(`<div class="hl-info z-overlay grid h-40 w-40 place-items-center"><!></div>`);

export default function Ignore($$anchor, $$props) {
	$.push($$props, true);

	let mounted = false;

	onMount(() => {
		setTimeout(
			() => {
				mounted = true;
			},
			500
		);
	});

	var div = root_1();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if (mounted) $$render(consequent);
		});
	}

	$.reset(div);
	$.action(div, ($$node, $$action_arg) => movable?.($$node, $$action_arg), () => ({ ignore: '.to-ignore' }));
	$.append($$anchor, div);
	$.pop();
}