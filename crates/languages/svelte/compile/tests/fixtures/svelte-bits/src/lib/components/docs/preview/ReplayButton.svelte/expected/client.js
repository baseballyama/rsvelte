import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="button" class="replay-button svelte-9y2dqi"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path></svg></button>`);

export default function ReplayButton($$anchor, $$props) {
	let label = $.prop($$props, 'label', 3, 'Replay animation');
	var button = root();

	$.template_effect(() => {
		$.set_attribute(button, 'aria-label', label());
		$.set_attribute(button, 'title', label());
	});

	$.delegated('click', button, function (...$$args) {
		$$props.onClick?.apply(this, $$args);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);