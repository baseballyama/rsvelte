import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { copy } from '@svelte-put/copy';
import { fade } from 'svelte/transition';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<div class="not-prose grid grid-cols-[1fr_auto_1fr] items-center gap-2"><button class="c-btn" type="button">Click</button>  <p>-></p> <div class="hl-success grid place-items-center self-stretch"><!></div></div>`);

export default function Custom_text($$anchor) {
	let copied = $.state('');

	// :::focus
	// :::highlight
	function copyText(input) {
		const { node } = input;

		$.set(copied, `Custom - ${node.innerText}`);

		return $.get(copied);
	}

	var // :::
	// :::
	div = root_1();

	var button = $.child(div);

	$.action(button, ($$node, $$action_arg) => copy?.($$node, $$action_arg), () => ({ event: 'pointerdown', text: copyText }));

	var div_1 = $.sibling(button, 4);
	var node_1 = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $.get(copied)));
			$.transition(1, p, () => fade, () => ({ duration: 200 }));
			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if ($.get(copied)) $$render(consequent);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}