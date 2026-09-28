import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var option_content = $.from_html(`<b class="svelte-q12eab">rich <i class="svelte-q12eab">italic</i></b><e class="svelte-q12eab">content</e>`, 1);
var select_content = $.from_html(`<button aria-label="Selected value" class="svelte-q12eab"><selectedcontent class="svelte-q12eab"></selectedcontent></button><option class="svelte-q12eab">plain text</option><option class="svelte-q12eab"><!></option>`, 1);
var root = $.from_html(`<select class="svelte-q12eab"><!></select>`);

export default function Input($$anchor) {
	var select = root();

	$.customizable_select(select, () => {
		var anchor = $.child(select);
		var fragment = select_content();
		var button = $.first_child(fragment);
		var selectedcontent = $.child(button);

		$.selectedcontent(selectedcontent, ($$element) => selectedcontent = $$element);
		$.reset(button);

		var option = $.sibling(button, 2);

		$.customizable_select(option, () => {
			var anchor_1 = $.child(option);
			var fragment_1 = option_content();

			$.next();
			$.append(anchor_1, fragment_1);
		});

		$.append(anchor, fragment);
	});

	$.append($$anchor, select);
}