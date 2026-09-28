import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div class="status-wrapper svelte-5yz92a"><div class="dot svelte-5yz92a"></div> <span class="name svelte-5yz92a"> </span></div></div>`);

export default function StatusStub($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var div_1 = $.child(div);
	var span = $.sibling($.child(div_1), 2);
	var text = $.only_child(span, true);

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `status ${$$props.data.type ?? ''}`, 'svelte-5yz92a');
		$.set_text(text, $$props.data.label);
	});

	$.append($$anchor, div);
	$.pop();
}