import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li><!></li>`);
var root_1 = $.from_html(`<!> <li><hr/></li>`, 1);

export default function HeaderPanelDivider($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var li = root();

			$.set_class(li, 1, '', null, {}, { 'bx--header-panel-divider': true });

			var node_1 = $.child(li);

			$.slot(node_1, $$props, 'default', {}, null);
			$.reset(li);
			$.append($$anchor, li);
		};

		$.if(node, ($$render) => {
			if ($$slots.default) $$render(consequent);
		});
	}

	var li_1 = $.sibling(node, 2);
	var hr = $.child(li_1);

	$.set_class(hr, 1, '', null, {}, { 'bx--switcher__item--divider': true });
	$.reset(li_1);
	$.append($$anchor, fragment);
}