import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="inline-block size-3 border border-border/50"></span>`);

export default function Color_indicator($$anchor, $$props) {
	var span = root();

	$.template_effect(() => $.set_style(span, `background-color: ${$$props.color ?? ''}`));
	$.append($$anchor, span);
}