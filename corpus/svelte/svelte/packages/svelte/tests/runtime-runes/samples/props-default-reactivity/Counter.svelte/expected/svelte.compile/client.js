import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button> </button> <button> </button> <button> </button>`, 1);

export default function Counter($$anchor, $$props) {
	$.push($$props, true);

	/** @type {{ object?: { count: number }, non_bindable?: { count: number }}} */
	let object = $.prop($$props, 'object', 31, () => $.proxy({ count: 0 })),
		non_bindable = $.prop($$props, 'non_bindable', 23, () => ({ count: 0 }));

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1);
	var button_2 = $.sibling(button_1, 2);
	var text_2 = $.only_child(button_2);
	var button_3 = $.sibling(button_2, 2);
	var text_3 = $.only_child(button_3);

	$.template_effect(() => {
		$.set_text(text, `mutate: ${object().count ?? ''}`);
		$.set_text(text_1, `reassign: ${object().count ?? ''}`);
		$.set_text(text_2, `mutate: ${non_bindable().count ?? ''}`);
		$.set_text(text_3, `reassign: ${non_bindable().count ?? ''}`);
	});

	$.delegated('click', button, () => object(object().count += 1, true));
	$.delegated('click', button_1, () => object({ count: object().count + 1 }));
	$.delegated('click', button_2, () => non_bindable().count += 1);
	$.delegated('click', button_3, () => non_bindable({ count: non_bindable().count + 1 }));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);