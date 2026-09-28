import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { formatShortcut } from '$lib/utils/keyboard';

var root = $.from_html(`<button class="shortcut-chip svelte-130xdyn"><span class="chip-label svelte-130xdyn"> </span> <span class="chip-shortcut svelte-130xdyn"> </span></button>`);

export default function KeyboardShortcutChip($$anchor, $$props) {
	$.push($$props, true);

	const formattedShortcut = $.derived(() => formatShortcut($$props.shortcut));
	var button = root();
	var span = $.child(button);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);

	$.reset(button);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-label', `${$$props.label ?? ''} - ${$.get(formattedShortcut) ?? ''}`);
		$.set_text(text, $$props.label);
		$.set_text(text_1, $.get(formattedShortcut));
	});

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);