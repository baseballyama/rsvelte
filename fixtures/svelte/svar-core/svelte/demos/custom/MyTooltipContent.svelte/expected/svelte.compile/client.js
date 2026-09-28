import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div style="padding: 4px 8px; color: #8df;"><div><b>Value</b> </div> <div><b>X</b> </div> <div><b>Y</b> </div></div>`);

export default function MyTooltipContent($$anchor, $$props) {
	var div = root();
	var div_1 = $.child(div);
	var text = $.sibling($.child(div_1));

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var text_1 = $.sibling($.child(div_2));

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var text_2 = $.sibling($.child(div_3));

	$.reset(div_3);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `: ${$$props.value ?? ''}`);
		$.set_text(text_1, `: ${$$props.x ?? ''}`);
		$.set_text(text_2, `: ${$$props.y ?? ''}`);
	});

	$.append($$anchor, div);
}