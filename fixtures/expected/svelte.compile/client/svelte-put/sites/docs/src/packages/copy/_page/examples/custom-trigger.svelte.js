import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { copy } from '@svelte-put/copy';
import { fade } from 'svelte/transition';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<div class="not-prose grid grid-cols-[0.5fr_auto_0.5fr_auto_1fr] items-center gap-4"><button class="c-btn" type="button">Click</button> <p>to</p> <div class="grid place-items-center border border-yellow-500 p-2"><p>copy this</p></div>  <p>-></p> <div class="hl-success grid place-items-center self-stretch"><!></div></div>`);

export default function Custom_trigger($$anchor) {
	let trigger = $.state(undefined);
	let copied = $.state('');

	function handleCopied(e) {
		$.set(copied, e.detail.text, true);
	}

	var div = root_1();
	var button = $.child(div);

	$.bind_this(button, ($$value) => $.set(trigger, $$value), () => $.get(trigger));

	var div_1 = $.sibling(button, 4);

	$.action(div_1, ($$node, $$action_arg) => copy?.($$node, $$action_arg), () => ({ trigger: $.get(trigger) }));

	var div_2 = $.sibling(div_1, 4);
	var node = $.child(div_2);

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

	$.reset(div_2);
	$.reset(div);
	$.event('copied', div_1, handleCopied);
	$.append($$anchor, div);
}