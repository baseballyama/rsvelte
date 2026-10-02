import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="table_icon svelte-17ze49a"><i class="wxi-dots-h"></i></div>`);

export default function IconCell($$anchor, $$props) {
	$.push($$props, true);

	function onClick() {
		$$props.onaction && $$props.onaction({
			action: "custom-icon",
			data: { column: $$props.column.id, row: $$props.row.id }
		});
	}

	var div = root();

	$.template_effect(() => $.set_attribute(div, 'data-action-id', $$props.row.id));
	$.delegated('click', div, onClick);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);