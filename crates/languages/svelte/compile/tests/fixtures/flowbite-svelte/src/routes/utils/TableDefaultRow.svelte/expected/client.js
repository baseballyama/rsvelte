import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";

var root = $.from_html(`<th scope="row" class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white"><!></th>`);
var root_1 = $.from_html(`<td class="px-6 py-4"><!></td>`);
var root_2 = $.from_html(`<tr></tr>`);
var root_3 = $.from_html(`<tr><td class="px-6 py-4"> </td></tr>`);

export default function TableDefaultRow($$anchor, $$props) {
	$.push($$props, true);

	const category = getContext("category");

	let trClass = $.derived(() => $$props.rowState === "striped"
		? "border-b dark:bg-gray-800 dark:border-gray-700 odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
		: $$props.rowState === "hover"
			? "bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
			: "bg-white border-b dark:bg-gray-800 dark:border-gray-700");

	let trLastClass = $.derived(() => $$props.rowState === "striped"
		? "odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
		: $$props.rowState === "hover"
			? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600"
			: "bg-white dark:bg-gray-800");

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_7 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => $$props.items, $.index, ($$anchor, item, i) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent_3 = ($$anchor) => {
						var tr = root_2();

						$.each(tr, 21, () => $.get(item), $.index, ($$anchor, cell, j) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							{
								var consequent_1 = ($$anchor) => {
									var th = root();
									var node_4 = $.child(th);

									{
										var consequent = ($$anchor) => {
											var fragment_4 = $.comment();
											var node_5 = $.first_child(fragment_4);

											$.html(node_5, () => $.get(cell));
											$.append($$anchor, fragment_4);
										};

										var alternate = ($$anchor) => {
											var text = $.text();

											$.template_effect(() => $.set_text(text, $.get(cell)));
											$.append($$anchor, text);
										};

										$.if(node_4, ($$render) => {
											if ($$props.html) $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.reset(th);
									$.append($$anchor, th);
								};

								var alternate_2 = ($$anchor) => {
									var td = root_1();
									var node_6 = $.child(td);

									{
										var consequent_2 = ($$anchor) => {
											var fragment_6 = $.comment();
											var node_7 = $.first_child(fragment_6);

											$.html(node_7, () => $.get(cell));
											$.append($$anchor, fragment_6);
										};

										var alternate_1 = ($$anchor) => {
											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, $.get(cell)));
											$.append($$anchor, text_1);
										};

										$.if(node_6, ($$render) => {
											if ($$props.html) $$render(consequent_2); else $$render(alternate_1, -1);
										});
									}

									$.reset(td);
									$.append($$anchor, td);
								};

								$.if(node_3, ($$render) => {
									if (j === 0) $$render(consequent_1); else $$render(alternate_2, -1);
								});
							}

							$.append($$anchor, fragment_3);
						});

						$.reset(tr);
						$.template_effect(() => $.set_class(tr, 1, $.clsx($.get(trLastClass))));
						$.append($$anchor, tr);
					};

					var alternate_6 = ($$anchor) => {
						var tr_1 = root_2();

						$.each(tr_1, 21, () => $.get(item), $.index, ($$anchor, cell, j) => {
							var fragment_8 = $.comment();
							var node_8 = $.first_child(fragment_8);

							{
								var consequent_5 = ($$anchor) => {
									var th_1 = root();
									var node_9 = $.child(th_1);

									{
										var consequent_4 = ($$anchor) => {
											var fragment_9 = $.comment();
											var node_10 = $.first_child(fragment_9);

											$.html(node_10, () => $.get(cell));
											$.append($$anchor, fragment_9);
										};

										var alternate_3 = ($$anchor) => {
											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, $.get(cell)));
											$.append($$anchor, text_2);
										};

										$.if(node_9, ($$render) => {
											if ($$props.html) $$render(consequent_4); else $$render(alternate_3, -1);
										});
									}

									$.reset(th_1);
									$.append($$anchor, th_1);
								};

								var alternate_5 = ($$anchor) => {
									var td_1 = root_1();
									var node_11 = $.child(td_1);

									{
										var consequent_6 = ($$anchor) => {
											var fragment_11 = $.comment();
											var node_12 = $.first_child(fragment_11);

											$.html(node_12, () => $.get(cell));
											$.append($$anchor, fragment_11);
										};

										var alternate_4 = ($$anchor) => {
											var text_3 = $.text();

											$.template_effect(() => $.set_text(text_3, $.get(cell)));
											$.append($$anchor, text_3);
										};

										$.if(node_11, ($$render) => {
											if ($$props.html) $$render(consequent_6); else $$render(alternate_4, -1);
										});
									}

									$.reset(td_1);
									$.append($$anchor, td_1);
								};

								$.if(node_8, ($$render) => {
									if (j === 0) $$render(consequent_5); else $$render(alternate_5, -1);
								});
							}

							$.append($$anchor, fragment_8);
						});

						$.reset(tr_1);
						$.template_effect(() => $.set_class(tr_1, 1, $.clsx($.get(trClass))));
						$.append($$anchor, tr_1);
					};

					$.if(node_2, ($$render) => {
						if (i === $$props.items.length - 1) $$render(consequent_3); else $$render(alternate_6, -1);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate_7 = ($$anchor) => {
			var fragment_13 = $.comment();
			var node_13 = $.first_child(fragment_13);

			$.each(node_13, 17, () => $$props.items, $.index, ($$anchor, tagName) => {
				var tr_2 = root_3();
				var td_2 = $.child(tr_2);
				var text_4 = $.only_child(td_2, true);

				$.reset(tr_2);

				$.template_effect(() => {
					$.set_class(tr_2, 1, $.clsx($.get(trClass)));
					$.set_text(text_4, $.get(tagName));
				});

				$.append($$anchor, tr_2);
			});

			$.append($$anchor, fragment_13);
		};

		$.if(node, ($$render) => {
			if (category === "props") $$render(consequent_7); else $$render(alternate_7, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}