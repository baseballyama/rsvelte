import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PageTypes } from '$lib/pocketbase/collections';
import Icon from '@iconify/svelte';

var root = $.from_html(`<span class="icon svelte-1wy94tl"><!></span> <span class="label svelte-1wy94tl">Page List</span>`, 1);
var root_1 = $.from_html(`<div>No page connected</div>`);
var root_2 = $.from_html(`<div class="page-list svelte-1wy94tl"><!></div>`);

export default function PageList($$anchor, $$props) {
	$.push($$props, true);

	const selected_page_type = $.derived(() => PageTypes.one($$props.field.config.page_type));
	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var span = $.first_child(fragment);
			let styles;
			var node_1 = $.child(span);

			Icon(node_1, {
				get icon() {
					return $.get(selected_page_type).icon;
				}
			});

			$.reset(span);
			$.next(2);
			$.template_effect(() => styles = $.set_style(span, '', styles, { background: $.get(selected_page_type).color }));
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(selected_page_type)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}