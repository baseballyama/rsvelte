import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container svelte-1mobw5b"><div class="content svelte-1mobw5b">this site is locked because it's being edited by <strong> </strong></div> <div class="buttons svelte-1mobw5b"><button class="button outlined svelte-1mobw5b">Try again</button> <a href="/" class="button svelte-1mobw5b">Back to Dashboard</a></div></div>`);

export default function LockAlert($$anchor, $$props) {
	var div = root();
	var div_1 = $.child(div);
	var strong = $.sibling($.child(div_1));
	var text = $.only_child(strong, true);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var button = $.child(div_2);

	$.next(2);
	$.reset(div_2);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $$props.email));

	$.delegated('click', button, () => {
		window.location.reload();
	});

	$.append($$anchor, div);
}

$.delegate(['click']);