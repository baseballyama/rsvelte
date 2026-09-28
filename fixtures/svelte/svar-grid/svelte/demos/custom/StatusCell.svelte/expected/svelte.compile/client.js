import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container svelte-wpn3rp"><div><div class="dot svelte-wpn3rp"></div> </div></div>`);

export default function StatusCell($$anchor, $$props) {
	$.push($$props, true);

	let status = $.derived(() => $$props.row.checked ? "active" : "non-active");
	var div = root();
	var div_1 = $.child(div);
	var text = $.sibling($.child(div_1));

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div_1, 1, `status ${$.get(status) ?? ''}`, 'svelte-wpn3rp');
		$.set_text(text, ` ${$.get(status) ?? ''}`);
	});

	$.append($$anchor, div);
	$.pop();
}