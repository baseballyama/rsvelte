import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="translate-false"><div></div> <div translate="no"></div> <div></div> <div></div></div> <div class="translate-true"><div></div> <div></div> <div translate="yes"></div> <div></div> <div></div> <div translate="false"></div> <div translate="banana"></div> <div></div> <div></div></div>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);

	$.set_attribute(div_1, 'translate', false);

	var div_2 = $.sibling(div_1, 4);

	$.attribute_effect(div_2, () => ({ ...{ translate: false } }));

	var div_3 = $.sibling(div_2, 2);

	$.attribute_effect(div_3, () => ({ ...{ translate: 'no' } }));
	$.reset(div);

	var div_4 = $.sibling(div, 2);
	var div_5 = $.sibling($.child(div_4), 2);

	$.set_attribute(div_5, 'translate', true);

	var div_6 = $.sibling(div_5, 4);

	$.attribute_effect(div_6, () => ({ ...{ translate: true } }));

	var div_7 = $.sibling(div_6, 2);

	$.attribute_effect(div_7, () => ({ ...{ translate: 'yes' } }));

	var div_8 = $.sibling(div_7, 6);

	$.attribute_effect(div_8, () => ({ ...{ translate: 'false' } }));

	var div_9 = $.sibling(div_8, 2);

	$.attribute_effect(div_9, () => ({ ...{ translate: 'banana' } }));
	$.reset(div_4);
	$.append($$anchor, fragment);
}