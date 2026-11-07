import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickoutside } from '@svelte-put/clickoutside';

var root = $.from_html(`<div class="relative w-full overflow-hidden"><div><div class="i i-[arrow-right] h-8 w-8"></div></div> <div class="mx-auto flex w-1/3"><button class="hl-success inline flex-1 cursor-pointer p-2 active:scale-95">Toggle Left</button> <button class="hl-error inline flex-1 cursor-pointer p-2 active:scale-95">Toggle Right</button></div> <div><div class="i i-[arrow-left] h-8 w-8"></div></div></div>`);

export default function Exclude($$anchor) {
	let leftOpen = $.state(true);

	// :::highlight success
	function toggleLeft(e) {
		e.stopPropagation();
		$.set(leftOpen, !$.get(leftOpen));
	}

	// :::
	let rightOpen = $.state(false);

	// :::highlight error
	function toggleRight() {
		$.set(rightOpen, !$.get(rightOpen));
	}

	// :::
	let containerEl = $.state(undefined);

	var div = root();
	var div_1 = $.child(div);

	$.action(div_1, ($$node, $$action_arg) => clickoutside?.($$node, $$action_arg), () => ({
		enabled: $.get(leftOpen),
		limit: { parent: $.get(containerEl) }
	}));

	var div_2 = $.sibling(div_1, 2);
	var button = $.child(div_2);
	var button_1 = $.sibling(button, 2);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);

	$.action(div_3, ($$node, $$action_arg) => clickoutside?.($$node, $$action_arg), () => ({
		enabled: $.get(rightOpen),
		limit: { parent: $.get(containerEl) }
	}));

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(containerEl, $$value), () => $.get(containerEl));

	$.template_effect(() => {
		$.set_class(div_1, 1, `bg-success-bg-100 absolute inset-y-0 left-0 grid w-1/3 origin-left place-items-center transition-[opacity_transform] ${$.get(leftOpen) ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-50'}`);
		$.set_class(div_3, 1, `bg-error-bg-100 absolute inset-y-0 right-0 grid w-1/3 origin-right place-items-center ${$.get(rightOpen) ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-50'}`);
	});

	$.event('clickoutside', div_1, toggleLeft);
	$.delegated('click', button, toggleLeft);
	$.delegated('click', button_1, toggleRight);
	$.event('clickoutside', div_3, toggleRight);
	$.append($$anchor, div);
}

$.delegate(['click']);