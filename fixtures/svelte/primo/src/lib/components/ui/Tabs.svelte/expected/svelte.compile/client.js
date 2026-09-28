import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '@iconify/svelte';
import { fade } from 'svelte/transition';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<button><!> </button>`);
var root_1 = $.from_html(`<div class="tabs svelte-h216gr"></div>`);

export default function Tabs($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();
	let active_tab_id = $.prop($$props, 'active_tab_id', 31, () => $.proxy($$props.tabs[0]?.id));

	$.user_effect(() => {
		dispatch('switch', active_tab_id());
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();

			$.each(div, 21, () => $$props.tabs, $.index, ($$anchor, tab) => {
				var button = root();
				let classes;
				var node_1 = $.child(button);

				{
					var consequent = ($$anchor) => {
						Icon($$anchor, {
							get icon() {
								return $.get(tab).icon;
							}
						});
					};

					$.if(node_1, ($$render) => {
						if ($.get(tab).icon) $$render(consequent);
					});
				}

				var text = $.sibling(node_1);

				$.reset(button);

				$.template_effect(() => {
					$.set_attribute(button, 'id', $.get(tab).id ? `tab-${$.get(tab).id}` : null);
					classes = $.set_class(button, 1, 'svelte-h216gr', null, classes, { active: active_tab_id() === $.get(tab).id });
					$.set_text(text, ` ${(typeof $.get(tab) === 'string' ? $.get(tab) : $.get(tab).label) ?? ''}`);
				});

				$.delegated('click', button, () => active_tab_id($.get(tab).id));
				$.append($$anchor, button);
			});

			$.reset(div);
			$.transition(1, div, () => fade, () => ({ duration: 200 }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.tabs.length > 1) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);