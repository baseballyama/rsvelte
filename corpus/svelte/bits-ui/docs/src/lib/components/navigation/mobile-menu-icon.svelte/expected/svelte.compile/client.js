import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="[&amp;_line]:stroke-foreground [&amp;_line]:stroke-2 [&amp;_line]:transition-all [&amp;_line]:duration-150 [&amp;_line]:ease-[cubic-bezier(0.4,0,0.2,1)]" stroke-linecap="round"><line class="origin-center data-[open=true]:translate-y-[4px] data-[open=true]:rotate-45" x1="3" y1="6" x2="21" y2="6"></line><line class="origin-left data-[open=true]:-translate-x-2 data-[open=true]:opacity-0" x1="3" y1="12" x2="12" y2="12"></line><line class="origin-right data-[open=true]:translate-x-2 data-[open=true]:opacity-0" x1="12" y1="12" x2="21" y2="12"></line><line class="origin-center data-[open=true]:-translate-y-[4.5px] data-[open=true]:-rotate-45" x1="3" y1="18" x2="21" y2="18"></line></svg>`);

export default function Mobile_menu_icon($$anchor, $$props) {
	var svg = root();
	var line = $.child(svg);
	var line_1 = $.sibling(line);
	var line_2 = $.sibling(line_1);
	var line_3 = $.sibling(line_2);

	$.reset(svg);

	$.template_effect(() => {
		$.set_attribute(line, 'data-open', $$props.open);
		$.set_attribute(line_1, 'data-open', $$props.open);
		$.set_attribute(line_2, 'data-open', $$props.open);
		$.set_attribute(line_3, 'data-open', $$props.open);
	});

	$.append($$anchor, svg);
}