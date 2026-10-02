import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div> </div> <!>`, 1);
var root_2 = $.from_html(`<div> </div>`);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent_7 = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			$.each(
				node_1,
				18,
				() => items,
				(hello) => hello.id,
				($$anchor, hello, i) => {
					var fragment_2 = root_1();
					var div = $.first_child(fragment_2);
					var text = $.only_child(div);
					var node_2 = $.sibling(div, 2);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							$.each(node_3, 16, () => items, $.index, ($$anchor, hello, $$index, $$array) => {
								var fragment_4 = $.comment();
								var node_4 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, hello));
										$.append($$anchor, text_1);
									};

									$.if(node_4, ($$render) => {
										if (hello) $$render(consequent);
									});
								}

								$.append($$anchor, fragment_4);
							});

							var node_5 = $.sibling(node_3, 2);

							$.each(node_5, 16, () => items, $.index, ($$anchor, foo, $$index_1, $$array_1) => {
								const hello = $.derived(() => foo);
								var fragment_6 = $.comment();
								var node_6 = $.first_child(fragment_6);

								{
									var consequent_1 = ($$anchor) => {
										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, $.get(hello)));
										$.append($$anchor, text_2);
									};

									$.if(node_6, ($$render) => {
										if ($.get(hello)) $$render(consequent_1);
									});
								}

								$.append($$anchor, fragment_6);
							});

							$.append($$anchor, fragment_3);
						};

						$.if(node_2, ($$render) => {
							if (hello) $$render(consequent_2);
						});
					}

					$.template_effect(() => $.set_text(text, `${hello ?? ''}${$.get(i) ?? ''}`));
					$.append($$anchor, fragment_2);
				},
				($$anchor) => {
					var fragment_8 = $.comment();
					var node_7 = $.first_child(fragment_8);

					{
						var consequent_3 = ($$anchor) => {
							var text_3 = $.text();

							text_3.nodeValue = hello;
							$.append($$anchor, text_3);
						};

						$.if(node_7, ($$render) => {
							if (hello) $$render(consequent_3);
						});
					}

					$.append($$anchor, fragment_8);
				}
			);

			var node_8 = $.sibling(node_1, 2);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_10 = $.comment();
					var node_9 = $.first_child(fragment_10);

					$.each(
						node_9,
						16,
						() => items,
						$.index,
						($$anchor, bye) => {
							var div_1 = root_2();
							var text_4 = $.only_child(div_1, true);

							$.template_effect(() => $.set_text(text_4, bye));
							$.append($$anchor, div_1);
						},
						($$anchor) => {
							var fragment_11 = $.comment();
							var node_10 = $.first_child(fragment_11);

							{
								var consequent_4 = ($$anchor) => {
									var text_5 = $.text();

									text_5.nodeValue = bye;
									$.append($$anchor, text_5);
								};

								$.if(node_10, ($$render) => {
									if (bye) $$render(consequent_4);
								});
							}

							$.append($$anchor, fragment_11);
						}
					);

					$.append($$anchor, fragment_10);
				};

				var consequent_6 = ($$anchor) => {
					var fragment_13 = $.comment();
					var node_11 = $.first_child(fragment_13);

					$.each(node_11, 16, () => items, $.index, ($$anchor, item, cool) => {
						var div_2 = root_2();
						var text_6 = $.only_child(div_2);

						$.template_effect(() => $.set_text(text_6, `${item ?? ''}${cool}`));
						$.append($$anchor, div_2);
					});

					$.append($$anchor, fragment_13);
				};

				var alternate = ($$anchor) => {
					var fragment_14 = $.comment();
					var node_12 = $.first_child(fragment_14);

					$.each(node_12, 16, () => items, $.index, ($$anchor, hello) => {
						var div_3 = root_2();
						var text_7 = $.only_child(div_3, true);

						$.template_effect(() => $.set_text(text_7, hello));
						$.append($$anchor, div_3);
					});

					$.append($$anchor, fragment_14);
				};

				$.if(node_8, ($$render) => {
					if (hi && bye) $$render(consequent_5); else if (cool) $$render(consequent_6, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (hello) $$render(consequent_7);
		});
	}

	var node_13 = $.sibling(node, 2);

	$.each(
		node_13,
		16,
		() => items,
		$.index,
		($$anchor, hello, i) => {
			var fragment_15 = $.comment();
			var node_14 = $.first_child(fragment_15);

			{
				var consequent_8 = ($$anchor) => {
					var text_8 = $.text();

					$.template_effect(() => $.set_text(text_8, `${hello ?? ''} ${i} ${bye ?? ''}`));
					$.append($$anchor, text_8);
				};

				var consequent_9 = ($$anchor) => {
					var text_9 = $.text();

					$.template_effect(() => $.set_text(text_9, `${hello ?? ''} ${i} ${bye ?? ''}`));
					$.append($$anchor, text_9);
				};

				var alternate_1 = ($$anchor) => {
					var text_10 = $.text();

					$.template_effect(() => $.set_text(text_10, `${hello ?? ''} ${i} ${bye ?? ''}`));
					$.append($$anchor, text_10);
				};

				$.if(node_14, ($$render) => {
					if (hello && i && bye) $$render(consequent_8); else if (hello && i && bye) $$render(consequent_9, 1); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_15);
		},
		($$anchor) => {
			var fragment_19 = $.comment();
			var node_15 = $.first_child(fragment_19);

			{
				var consequent_10 = ($$anchor) => {
					var text_11 = $.text();

					text_11.nodeValue = `${hello ?? ''} ${i ?? ''} ${bye ?? ''}`;
					$.append($$anchor, text_11);
				};

				var consequent_11 = ($$anchor) => {
					var text_12 = $.text();

					text_12.nodeValue = `${hello ?? ''} ${i ?? ''} ${bye ?? ''}`;
					$.append($$anchor, text_12);
				};

				var alternate_2 = ($$anchor) => {
					var text_13 = $.text();

					text_13.nodeValue = `${hello ?? ''} ${i ?? ''} ${bye ?? ''}`;
					$.append($$anchor, text_13);
				};

				$.if(node_15, ($$render) => {
					if (hello && i && bye) $$render(consequent_10); else if (hello && i && bye) $$render(consequent_11, 1); else $$render(alternate_2, -1);
				});
			}

			$.append($$anchor, fragment_19);
		}
	);

	$.append($$anchor, fragment);
}