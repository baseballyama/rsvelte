import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { copy } from '@svelte-put/copy';
import { fade } from 'svelte/transition';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<div class="not-prose grid grid-cols-[1fr_auto_1fr] items-center gap-2"><button class="c-btn" type="button"><strong>Click</strong> <span>synthetic copy</span></button> <p>-></p> <div class="hl-success grid place-items-center self-stretch"><!></div></div>`);

export default function Synthetic_copy($$anchor) {
	let copied = $.state('');

	function onSyntheticCopy(e) {
		const clipboardData = e.clipboardData;

		$.set(copied, clipboardData?.getData('text/plain') ?? '', true);

		// clipboardData.setData will have no effect here
	}

	var div = root_1();
	var button = $.child(div);

	$.action(button, ($$node, $$action_arg) => copy?.($$node, $$action_arg), () => ({ synthetic: true }));

	var div_1 = $.sibling(button, 4);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $.get(copied)));
			$.transition(1, p, () => fade, () => ({ duration: 200 }));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(copied)) $$render(consequent);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.event('copy', button, onSyntheticCopy);
	$.append($$anchor, div);
}