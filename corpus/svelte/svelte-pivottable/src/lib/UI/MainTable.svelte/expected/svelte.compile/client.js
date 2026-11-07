import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<table class="pvtUi"><tbody><tr><td class="pvtRenderers"><!></td><td class="pvtAxisContainer pvtUnused pvtHorizList"><!></td></tr><tr><td class="pvtVals"><!></td><td class="pvtAxisContainer pvtHorizList pvtCols"><!></td></tr><tr><td class="pvtAxisContainer pvtVertList pvtRows"><!></td><td class="pvtOutput"><!></td></tr></tbody></table>`);
var root_1 = $.from_html(`<table class="pvtUi"><tbody><tr><td class="pvtRenderers"><!></td><td class="pvtVals"><!></td><td class="pvtAxisContainer pvtHorizList pvtCols"><!></td></tr><tr><td class="pvtAxisContainer pvtUnused pvtVertList"><!></td><td class="pvtAxisContainer pvtVertList pvtRows"><!></td><td class="pvtOutput"><!></td></tr></tbody></table>`);

export default function MainTable($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var table = root();
			var tbody = $.child(table);
			var tr = $.child(tbody);
			var td = $.child(tr);
			var node_1 = $.child(td);

			$.snippet(node_1, () => $$props.rendererCell);
			$.reset(td);

			var td_1 = $.sibling(td);
			var node_2 = $.child(td_1);

			$.snippet(node_2, () => $$props.unusedAttrsCell);
			$.reset(td_1);
			$.reset(tr);

			var tr_1 = $.sibling(tr);
			var td_2 = $.child(tr_1);
			var node_3 = $.child(td_2);

			$.snippet(node_3, () => $$props.aggregatorCell);
			$.reset(td_2);

			var td_3 = $.sibling(td_2);
			var node_4 = $.child(td_3);

			$.snippet(node_4, () => $$props.colAttrsCell);
			$.reset(td_3);
			$.reset(tr_1);

			var tr_2 = $.sibling(tr_1);
			var td_4 = $.child(tr_2);
			var node_5 = $.child(td_4);

			$.snippet(node_5, () => $$props.rowAttrsCell);
			$.reset(td_4);

			var td_5 = $.sibling(td_4);
			var node_6 = $.child(td_5);

			$.snippet(node_6, () => $$props.outputCell);
			$.reset(td_5);
			$.reset(tr_2);
			$.reset(tbody);
			$.reset(table);
			$.append($$anchor, table);
		};

		var alternate = ($$anchor) => {
			var table_1 = root_1();
			var tbody_1 = $.child(table_1);
			var tr_3 = $.child(tbody_1);
			var td_6 = $.child(tr_3);
			var node_7 = $.child(td_6);

			$.snippet(node_7, () => $$props.rendererCell);
			$.reset(td_6);

			var td_7 = $.sibling(td_6);
			var node_8 = $.child(td_7);

			$.snippet(node_8, () => $$props.aggregatorCell);
			$.reset(td_7);

			var td_8 = $.sibling(td_7);
			var node_9 = $.child(td_8);

			$.snippet(node_9, () => $$props.colAttrsCell);
			$.reset(td_8);
			$.reset(tr_3);

			var tr_4 = $.sibling(tr_3);
			var td_9 = $.child(tr_4);
			var node_10 = $.child(td_9);

			$.snippet(node_10, () => $$props.unusedAttrsCell);
			$.reset(td_9);

			var td_10 = $.sibling(td_9);
			var node_11 = $.child(td_10);

			$.snippet(node_11, () => $$props.rowAttrsCell);
			$.reset(td_10);

			var td_11 = $.sibling(td_10);
			var node_12 = $.child(td_11);

			$.snippet(node_12, () => $$props.outputCell);
			$.reset(td_11);
			$.reset(tr_4);
			$.reset(tbody_1);
			$.reset(table_1);
			$.append($$anchor, table_1);
		};

		$.if(node, ($$render) => {
			if ($$props.horizUnused) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}