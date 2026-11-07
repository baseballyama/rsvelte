import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent_8 = ($$anchor) => {
			var fragment_1 = root_3();
			var node_1 = $.first_child(fragment_1);

			$.await(
				node_1,
				() => aPromise,
				null,
				($$anchor, hello) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, $.get(hello)));
					$.append($$anchor, text);
				},
				($$anchor) => {
					var text_1 = $.text();

					text_1.nodeValue = hello;
					$.append($$anchor, text_1);
				}
			);

			var node_2 = $.sibling(node_1, 2);

			$.await(
				node_2,
				() => aPromise,
				null,
				($$anchor, foo) => {
					const hello = $.derived(() => $.get(foo));
					var text_2 = $.text();

					$.template_effect(() => $.set_text(text_2, $.get(hello)));
					$.append($$anchor, text_2);
				},
				($$anchor) => {
					var text_3 = $.text();

					text_3.nodeValue = hello;
					$.append($$anchor, text_3);
				}
			);

			var node_3 = $.sibling(node_2, 2);

			$.await(
				node_3,
				() => aPromise,
				null,
				($$anchor, hi) => {
					var text_4 = $.text();

					text_4.nodeValue = hello;
					$.append($$anchor, text_4);
				},
				($$anchor, hello) => {
					var text_5 = $.text();

					$.template_effect(() => $.set_text(text_5, $.get(hello)));
					$.append($$anchor, text_5);
				}
			);

			var node_4 = $.sibling(node_3, 2);

			$.await(node_4, () => $.get(hello), null, ($$anchor, hello) => {
				var fragment_8 = root_1();
				var text_6 = $.first_child(fragment_8);
				var node_5 = $.sibling(text_6);

				{
					var consequent_2 = ($$anchor) => {
						var fragment_9 = root();
						var node_6 = $.first_child(fragment_9);

						$.await(node_6, () => aPromise, ($$anchor) => {
							var text_7 = $.text();

							$.template_effect(() => $.set_text(text_7, $.get(hello)));
							$.append($$anchor, text_7);
						});

						var node_7 = $.sibling(node_6, 2);

						$.await(
							node_7,
							() => aPromise,
							($$anchor) => {
								var text_9 = $.text();

								$.template_effect(() => $.set_text(text_9, $.get(hello)));
								$.append($$anchor, text_9);
							},
							void 0,
							($$anchor, hello) => {
								var text_8 = $.text();

								$.template_effect(() => $.set_text(text_8, $.get(hello)));
								$.append($$anchor, text_8);
							}
						);

						var node_8 = $.sibling(node_7, 2);

						$.await(node_8, () => x, null, ($$anchor, hello) => {
							var fragment_13 = $.comment();
							var node_9 = $.first_child(fragment_13);

							{
								var consequent = ($$anchor) => {
									var text_10 = $.text();

									$.template_effect(() => $.set_text(text_10, $.get(hello)));
									$.append($$anchor, text_10);
								};

								$.if(node_9, ($$render) => {
									if ($.get(hello)) $$render(consequent);
								});
							}

							$.append($$anchor, fragment_13);
						});

						var node_10 = $.sibling(node_8, 2);

						$.await(node_10, () => x, null, ($$anchor, foo) => {
							const hello = $.derived(() => $.get(foo));
							var fragment_15 = $.comment();
							var node_11 = $.first_child(fragment_15);

							{
								var consequent_1 = ($$anchor) => {
									var text_11 = $.text();

									$.template_effect(() => $.set_text(text_11, $.get(hello)));
									$.append($$anchor, text_11);
								};

								$.if(node_11, ($$render) => {
									if ($.get(hello)) $$render(consequent_1);
								});
							}

							$.append($$anchor, fragment_15);
						});

						$.append($$anchor, fragment_9);
					};

					$.if(node_5, ($$render) => {
						if ($.get(hello)) $$render(consequent_2);
					});
				}

				$.template_effect(() => $.set_text(text_6, `${$.get(hello) ?? ''} `));
				$.append($$anchor, fragment_8);
			});

			var node_12 = $.sibling(node_4, 2);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_17 = $.comment();
					var node_13 = $.first_child(fragment_17);

					$.await(
						node_13,
						() => x,
						null,
						($$anchor, bye) => {
							var text_12 = $.text();

							$.template_effect(() => $.set_text(text_12, $.get(bye)));
							$.append($$anchor, text_12);
						},
						($$anchor, hello) => {
							var fragment_19 = $.comment();
							var node_14 = $.first_child(fragment_19);

							{
								var consequent_3 = ($$anchor) => {
									var text_13 = $.text();

									$.template_effect(() => $.set_text(text_13, $.get(hello)));
									$.append($$anchor, text_13);
								};

								$.if(node_14, ($$render) => {
									if ($.get(hello)) $$render(consequent_3);
								});
							}

							$.append($$anchor, fragment_19);
						}
					);

					$.append($$anchor, fragment_17);
				};

				var consequent_6 = ($$anchor) => {
					var fragment_21 = root_2();
					var node_15 = $.first_child(fragment_21);

					$.await(
						node_15,
						() => cool,
						($$anchor) => {
							var text_16 = $.text('loading');

							$.append($$anchor, text_16);
						},
						($$anchor, cool) => {
							var fragment_22 = $.comment();
							var node_16 = $.first_child(fragment_22);

							{
								var consequent_5 = ($$anchor) => {
									var text_14 = $.text();

									$.template_effect(() => $.set_text(text_14, $.get(cool)));
									$.append($$anchor, text_14);
								};

								$.if(node_16, ($$render) => {
									if ($.get(cool)) $$render(consequent_5);
								});
							}

							$.append($$anchor, fragment_22);
						},
						($$anchor, cool) => {
							var text_15 = $.text('z');

							$.append($$anchor, text_15);
						}
					);

					var node_17 = $.sibling(node_15, 2);

					$.await(
						node_17,
						() => aPromise,
						($$anchor) => {
							var text_18 = $.text('loading');

							$.append($$anchor, text_18);
						},
						($$anchor, cool) => {
							var text_17 = $.text();

							$.template_effect(() => $.set_text(text_17, $.get(cool)));
							$.append($$anchor, text_17);
						}
					);

					$.append($$anchor, fragment_21);
				};

				var alternate = ($$anchor) => {
					var fragment_25 = $.comment();
					var node_18 = $.first_child(fragment_25);

					$.await(node_18, () => x, null, ($$anchor, hello) => {
						var fragment_26 = $.comment();
						var node_19 = $.first_child(fragment_26);

						{
							var consequent_7 = ($$anchor) => {
								var text_19 = $.text();

								$.template_effect(() => $.set_text(text_19, $.get(hello)));
								$.append($$anchor, text_19);
							};

							$.if(node_19, ($$render) => {
								if ($.get(hello)) $$render(consequent_7);
							});
						}

						$.append($$anchor, fragment_26);
					});

					$.append($$anchor, fragment_25);
				};

				$.if(node_12, ($$render) => {
					if (hi && bye) $$render(consequent_4); else if (cool) $$render(consequent_6, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (hello) $$render(consequent_8);
		});
	}

	var node_20 = $.sibling(node, 2);

	$.await(
		node_20,
		() => cool,
		($$anchor) => {
			var fragment_34 = $.comment();
			var node_23 = $.first_child(fragment_34);

			{
				var consequent_13 = ($$anchor) => {
					var text_24 = $.text();

					text_24.nodeValue = $.get(cool);
					$.append($$anchor, text_24);
				};

				var consequent_14 = ($$anchor) => {
					var text_25 = $.text();

					text_25.nodeValue = hello;
					$.append($$anchor, text_25);
				};

				$.if(node_23, ($$render) => {
					if ($.get(cool)) $$render(consequent_13); else if (hello) $$render(consequent_14, 1);
				});
			}

			$.append($$anchor, fragment_34);
		},
		($$anchor, cool) => {
			var fragment_28 = $.comment();
			var node_21 = $.first_child(fragment_28);

			{
				var consequent_9 = ($$anchor) => {
					var text_20 = $.text();

					$.template_effect(() => $.set_text(text_20, $.get(cool)));
					$.append($$anchor, text_20);
				};

				var consequent_10 = ($$anchor) => {
					var text_21 = $.text();

					text_21.nodeValue = hello;
					$.append($$anchor, text_21);
				};

				$.if(node_21, ($$render) => {
					if ($.get(cool)) $$render(consequent_9); else if (hello) $$render(consequent_10, 1);
				});
			}

			$.append($$anchor, fragment_28);
		},
		($$anchor, cool) => {
			var fragment_31 = $.comment();
			var node_22 = $.first_child(fragment_31);

			{
				var consequent_11 = ($$anchor) => {
					var text_22 = $.text();

					$.template_effect(() => $.set_text(text_22, $.get(cool)));
					$.append($$anchor, text_22);
				};

				var consequent_12 = ($$anchor) => {
					var text_23 = $.text();

					text_23.nodeValue = hello;
					$.append($$anchor, text_23);
				};

				$.if(node_22, ($$render) => {
					if ($.get(cool)) $$render(consequent_11); else if (hello) $$render(consequent_12, 1);
				});
			}

			$.append($$anchor, fragment_31);
		}
	);

	$.append($$anchor, fragment);
}