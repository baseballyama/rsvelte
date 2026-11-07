import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="c svelte-er69un"></div>`);
var root_1 = $.from_html(`<div class="d svelte-er69un"></div>`);
var root_2 = $.from_html(`<div class="b svelte-er69un"></div> <!>`, 1);
var root_3 = $.from_html(`<div class="e svelte-er69un"></div>`);
var root_4 = $.from_html(`<div class="f svelte-er69un"></div>`);
var root_5 = $.from_html(`<div class="h svelte-er69un"></div>`);
var root_6 = $.from_html(`<div class="i svelte-er69un"></div>`);
var root_7 = $.from_html(`<div class="g svelte-er69un"></div> <!> <div class="j svelte-er69un"></div>`, 1);
var root_8 = $.from_html(`<div class="l svelte-er69un"></div>`);
var root_9 = $.from_html(`<div class="m svelte-er69un"></div>`);
var root_10 = $.from_html(`<div class="a svelte-er69un"></div> <!> <!> <!> <div class="k svelte-er69un"></div> <!>`, 1);

export default function Input($$anchor) {
	let array = [];
	var fragment = root_10();
	var node = $.sibling($.first_child(fragment), 2);

	$.each(node, 17, () => array, $.index, ($$anchor, a) => {
		var fragment_1 = root_2();
		var node_1 = $.sibling($.first_child(fragment_1), 2);

		$.each(
			node_1,
			17,
			() => array,
			$.index,
			($$anchor, b) => {
				var div = root();

				$.append($$anchor, div);
			},
			($$anchor) => {
				var div_1 = root_1();

				$.append($$anchor, div_1);
			}
		);

		$.append($$anchor, fragment_1);
	});

	var node_2 = $.sibling(node, 2);

	$.each(
		node_2,
		17,
		() => array,
		$.index,
		($$anchor, c) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.each(node_3, 17, () => array, $.index, ($$anchor, d) => {
				var div_2 = root_3();

				$.append($$anchor, div_2);
			});

			$.append($$anchor, fragment_2);
		},
		($$anchor) => {
			var div_3 = root_4();

			$.append($$anchor, div_3);
		}
	);

	var node_4 = $.sibling(node_2, 2);

	$.each(node_4, 17, () => array, $.index, ($$anchor, item) => {
		var fragment_3 = root_7();
		var node_5 = $.sibling($.first_child(fragment_3), 2);

		$.each(
			node_5,
			17,
			() => array,
			$.index,
			($$anchor, item, $$index_5, $$array) => {
				var fragment_4 = $.comment();
				var node_6 = $.first_child(fragment_4);

				$.each(node_6, 17, () => array, $.index, ($$anchor, item, $$index_4, $$array_1) => {
					var div_4 = root_5();

					$.append($$anchor, div_4);
				});

				$.append($$anchor, fragment_4);
			},
			($$anchor) => {
				var div_5 = root_6();

				$.append($$anchor, div_5);
			}
		);

		$.next(2);
		$.append($$anchor, fragment_3);
	});

	var node_7 = $.sibling(node_4, 4);

	$.each(node_7, 17, () => array, $.index, ($$anchor, item) => {
		var fragment_5 = $.comment();
		var node_8 = $.first_child(fragment_5);

		$.each(
			node_8,
			17,
			() => array,
			$.index,
			($$anchor, item, $$index_7, $$array_2) => {
				var div_6 = root_8();

				$.append($$anchor, div_6);
			},
			($$anchor) => {
				var div_7 = root_9();

				$.append($$anchor, div_7);
			}
		);

		$.append($$anchor, fragment_5);
	});

	$.append($$anchor, fragment);
}