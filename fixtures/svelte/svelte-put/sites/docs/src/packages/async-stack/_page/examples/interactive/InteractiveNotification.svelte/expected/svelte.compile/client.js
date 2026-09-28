import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fly } from 'svelte/transition';

var root = $.from_html(`<div class="bg-bg-100 pointer-events-auto rounded-sm px-4 py-2 shadow-lg"><p class="text-xl font-bold">Invitation</p> <p class="text-lg"> </p> <div class="flex gap-6"><button class="c-btn w-40">Join</button> <button class="c-btn c-btn--outlined w-40">Delete</button></div></div>`);

export default function InteractiveNotification($$anchor, $$props) {
	$.push($$props, true);

	// :::highlight
	const join = () => $$props.item.resolve(true);

	const del = () => $$props.item.resolve(false);

	var // :::
	div = root();

	var p = $.sibling($.child(div), 2);
	var text = $.only_child(p, true);
	var div_1 = $.sibling(p, 2);
	var button = $.child(div_1);
	var button_1 = $.sibling(button, 2);

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $$props.message));
	$.delegated('click', button, join);
	$.delegated('click', button_1, del);
	$.transition(5, div, () => fly, () => ({ duration: 200, y: -20 }));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);