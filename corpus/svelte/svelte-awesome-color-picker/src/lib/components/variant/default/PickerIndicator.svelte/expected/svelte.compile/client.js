import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="picker-indicator svelte-1k6x07n"></div>`);

export default function PickerIndicator($$anchor, $$props) {
	$.push($$props, true);

	var /** indicator position in % */
	div = root();

	let styles;

	$.template_effect(() => styles = $.set_style(div, '', styles, { '--pos-x': $$props.pos.x, '--pos-y': $$props.pos.y }));
	$.append($$anchor, div);
	$.pop();
}