import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<tr><td><code class="prop-code"> </code></td><td><span class="prop-type"> </span></td><td><code class="prop-code"> </code></td><td> </td></tr>`);
var root_1 = $.from_html(`<div class="prop-card"><div class="prop-card-header"><code class="prop-code"> </code> <span class="prop-card-type"> </span></div> <p class="prop-card-desc"> </p> <div class="prop-card-default"><span class="prop-card-label">Default:</span> <code class="prop-code"> </code></div></div>`);
var root_2 = $.from_html(`<section class="prop-table-section"><h2 class="demo-title-extra">Props</h2> <div class="prop-table-wrap"><table class="prop-table"><thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody></tbody></table></div> <div class="prop-cards"></div></section>`);

export default function PropTable($$anchor, $$props) {
	var section = root_2();
	var div = $.sibling($.child(section), 2);
	var table = $.child(div);
	var tbody = $.sibling($.child(table));

	$.each(tbody, 21, () => $$props.rows, (row) => row.name, ($$anchor, row) => {
		var tr = root();
		var td = $.child(tr);
		var code = $.child(td);
		var text = $.only_child(code, true);

		$.reset(td);

		var td_1 = $.sibling(td);
		var span = $.child(td_1);
		var text_1 = $.only_child(span, true);

		$.reset(td_1);

		var td_2 = $.sibling(td_1);
		var code_1 = $.child(td_2);
		var text_2 = $.only_child(code_1, true);

		$.reset(td_2);

		var td_3 = $.sibling(td_2);
		var text_3 = $.only_child(td_3, true);

		$.reset(tr);

		$.template_effect(() => {
			$.set_text(text, $.get(row).name);
			$.set_text(text_1, $.get(row).type);
			$.set_text(text_2, $.get(row).default);
			$.set_text(text_3, $.get(row).description);
		});

		$.append($$anchor, tr);
	});

	$.reset(tbody);
	$.reset(table);
	$.reset(div);

	var div_1 = $.sibling(div, 2);

	$.each(div_1, 21, () => $$props.rows, (row) => row.name, ($$anchor, row) => {
		var div_2 = root_1();
		var div_3 = $.child(div_2);
		var code_2 = $.child(div_3);
		var text_4 = $.only_child(code_2, true);
		var span_1 = $.sibling(code_2, 2);
		var text_5 = $.only_child(span_1, true);

		$.reset(div_3);

		var p = $.sibling(div_3, 2);
		var text_6 = $.only_child(p, true);
		var div_4 = $.sibling(p, 2);
		var code_3 = $.sibling($.child(div_4), 2);
		var text_7 = $.only_child(code_3, true);

		$.reset(div_4);
		$.reset(div_2);

		$.template_effect(() => {
			$.set_text(text_4, $.get(row).name);
			$.set_text(text_5, $.get(row).type);
			$.set_text(text_6, $.get(row).description);
			$.set_text(text_7, $.get(row).default);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(section);
	$.append($$anchor, section);
}