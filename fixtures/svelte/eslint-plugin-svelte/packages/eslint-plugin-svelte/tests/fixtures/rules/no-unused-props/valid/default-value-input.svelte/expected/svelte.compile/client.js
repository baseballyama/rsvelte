import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="col-span-full"><div> </div></div>`);

export default function Default_value_input($$anchor, $$props) {
	$.push($$props, true);

	const newTaskAttributes = $.prop($$props, 'newTaskAttributes', 19, () => ({ attribute: 0, attribute2: '' }));
	var div = root();
	var div_1 = $.child(div);
	var text = $.only_child(div_1);

	$.reset(div);

	$.template_effect(() => $.set_text(text, `${newTaskAttributes().attribute ?? ''}
		${newTaskAttributes().attribute2 ?? ''}`));

	$.append($$anchor, div);
	$.pop();
}