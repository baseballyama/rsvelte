import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="button" role="option" class="hover:bg-accent aria-selected:bg-accent w-full cursor-default rounded-sm px-2 py-1.5 text-left text-sm outline-hidden transition-colors select-none"> </button>`);

export default function Tags_input_suggestion($$anchor, $$props) {
	$.push($$props, true);

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => {
		$.set_attribute(button, 'id', $$props.id);
		$.set_attribute(button, 'aria-selected', $$props.active);
		$.set_text(text, $$props.value);
	});

	$.delegated('mousedown', button, (e) => {
		e.preventDefault();
		$$props.onSelect($$props.value);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['mousedown']);