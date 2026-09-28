import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div><!> <div><strong> </strong> <div class="status-text svelte-1mctc6b"> </div></div></div>`);
var root_1 = $.from_html(`<div class="status-overview"></div>`);

export default function StatusOverview($$anchor, $$props) {
	var div = root_1();

	$.each(div, 21, () => $$props.items, (item) => item.label, ($$anchor, item) => {
		var div_1 = root();
		var node = $.child(div_1);

		Icon(node, {
			get name() {
				return $.get(item).icon;
			},
			size: 'sm'
		});

		var div_2 = $.sibling(node, 2);
		var strong = $.child(div_2);
		var text = $.only_child(strong, true);
		var div_3 = $.sibling(strong, 2);
		var text_1 = $.only_child(div_3, true);

		$.reset(div_2);
		$.reset(div_1);

		$.template_effect(() => {
			$.set_class(div_1, 1, `status-item ${($.get(item).status || '') ?? ''}`, 'svelte-1mctc6b');
			$.set_text(text, $.get(item).value);
			$.set_text(text_1, $.get(item).label);
		});

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
}