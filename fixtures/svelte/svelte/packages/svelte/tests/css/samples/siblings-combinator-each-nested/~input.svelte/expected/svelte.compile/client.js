import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="b"></div> <div class="c svelte-z4nn9b"></div>`, 1);
var root_1 = $.from_html(`<div class="d svelte-z4nn9b"></div>`);
var root_2 = $.from_html(`<!> <div class="e svelte-z4nn9b"></div>`, 1);
var root_3 = $.from_html(`<!> <div class="f svelte-z4nn9b"></div>`, 1);
var root_4 = $.from_html(`<div class="i svelte-z4nn9b"></div>`);
var root_5 = $.from_html(`<div class="h svelte-z4nn9b"></div> <!>`, 1);
var root_6 = $.from_html(`<div class="g svelte-z4nn9b"></div> <!>`, 1);
var root_7 = $.from_html(`<div class="l svelte-z4nn9b"></div>`);
var root_8 = $.from_html(`<div class="k svelte-z4nn9b"></div> <!>`, 1);
var root_9 = $.from_html(`<div class="j svelte-z4nn9b"></div> <!>`, 1);
var root_10 = $.from_html(`<div class="m svelte-z4nn9b"></div>`);
var root_11 = $.from_html(`<!> <div class="n svelte-z4nn9b"></div>`, 1);
var root_12 = $.from_html(`<!> <div class="o svelte-z4nn9b"></div>`, 1);
var root_13 = $.from_html(`<div class="a svelte-z4nn9b"></div> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	let array = [1];
	var fragment = root_13();
	var node = $.sibling($.first_child(fragment), 2);

	$.each(node, 17, () => array, $.index, ($$anchor, item) => {
		var fragment_1 = root();

		$.next(2);
		$.append($$anchor, fragment_1);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 17, () => array, $.index, ($$anchor, item) => {
		var fragment_2 = root_3();
		var node_2 = $.first_child(fragment_2);

		$.each(node_2, 17, () => array, $.index, ($$anchor, item, $$index_2, $$array) => {
			var fragment_3 = root_2();
			var node_3 = $.first_child(fragment_3);

			$.each(node_3, 17, () => array, $.index, ($$anchor, item, $$index_1, $$array_1) => {
				var div = root_1();

				$.append($$anchor, div);
			});

			$.next(2);
			$.append($$anchor, fragment_3);
		});

		$.next(2);
		$.append($$anchor, fragment_2);
	});

	var node_4 = $.sibling(node_1, 2);

	$.each(node_4, 17, () => array, $.index, ($$anchor, item) => {
		var fragment_4 = root_6();
		var node_5 = $.sibling($.first_child(fragment_4), 2);

		$.each(node_5, 17, () => array, $.index, ($$anchor, item, $$index_5, $$array_2) => {
			var fragment_5 = root_5();
			var node_6 = $.sibling($.first_child(fragment_5), 2);

			$.each(node_6, 17, () => array, $.index, ($$anchor, item, $$index_4, $$array_3) => {
				var div_1 = root_4();

				$.append($$anchor, div_1);
			});

			$.append($$anchor, fragment_5);
		});

		$.append($$anchor, fragment_4);
	});

	var node_7 = $.sibling(node_4, 2);

	$.each(node_7, 17, () => array, $.index, ($$anchor, item) => {
		var fragment_6 = root_9();
		var node_8 = $.sibling($.first_child(fragment_6), 2);

		$.each(node_8, 17, () => array, $.index, ($$anchor, item, $$index_8, $$array_4) => {
			var fragment_7 = root_8();
			var node_9 = $.sibling($.first_child(fragment_7), 2);

			$.each(node_9, 17, () => array, $.index, ($$anchor, item, $$index_7, $$array_5) => {
				var div_2 = root_7();

				$.append($$anchor, div_2);
			});

			$.append($$anchor, fragment_7);
		});

		$.append($$anchor, fragment_6);
	});

	var node_10 = $.sibling(node_7, 2);

	$.each(node_10, 17, () => array, $.index, ($$anchor, item) => {
		var fragment_8 = root_12();
		var node_11 = $.first_child(fragment_8);

		$.each(node_11, 17, () => array, $.index, ($$anchor, item, $$index_11, $$array_6) => {
			var fragment_9 = root_11();
			var node_12 = $.first_child(fragment_9);

			$.each(node_12, 17, () => array, $.index, ($$anchor, item, $$index_10, $$array_7) => {
				var div_3 = root_10();

				$.append($$anchor, div_3);
			});

			$.next(2);
			$.append($$anchor, fragment_9);
		});

		$.next(2);
		$.append($$anchor, fragment_8);
	});

	$.append($$anchor, fragment);
}