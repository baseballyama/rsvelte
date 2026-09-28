import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import XIcon from '@lucide/svelte/icons/x';

var root = $.from_html(`<div class="bg-secondary ring-offset-background hover:bg-secondary/90 aria-selected:bg-secondary/90 aria-selected:ring-ring flex place-items-center gap-2 rounded-md px-2 py-0.5 transition-all hover:cursor-default aria-selected:ring-2 aria-selected:ring-offset-2"><span> </span> <button type="button"><!></button></div>`);

export default function Tags_input_tag($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var span = $.child(div);
	var text = $.only_child(span, true);
	var button = $.sibling(span, 2);
	var node = $.child(button);

	XIcon(node, { class: 'size-4' });
	$.reset(button);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div, 'aria-selected', $$props.active);
		$.set_text(text, $$props.value);
		button.disabled = $$props.disabled;
	});

	$.delegated('click', button, () => $$props.onDelete($$props.value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);