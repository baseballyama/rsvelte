import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(` <!> <!>  <!>`, 1);
var root_2 = $.from_html(`<p slot="named2"><!></p>`);
var root_3 = $.from_html(`<div slot="named"> </div>`);
var root_4 = $.from_html(`<p slot="named3"><!></p>`);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent_10 = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Comp(node_1, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const hello = $.derived(() => $$slotProps.hello);

						$.next();

						var fragment_2 = root_1();
						var text = $.first_child(fragment_2);
						var node_2 = $.sibling(text);

						Comp(node_2, {
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$anchor, $$slotProps) => {
									const hello = $.derived(() => $$slotProps.hello);
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									{
										var consequent = ($$anchor) => {
											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, $.get(hello)));
											$.append($$anchor, text_1);
										};

										$.if(node_3, ($$render) => {
											if ($.get(hello)) $$render(consequent);
										});
									}

									$.append($$anchor, fragment_3);
								}
							}
						});

						var node_4 = $.sibling(node_2, 2);

						Comp(node_4, {
							get hello() {
								return $.get(hello);
							},
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$anchor, $$slotProps) => {
									const hello = $.derived(() => $$slotProps.hello);
									var fragment_5 = $.comment();
									var node_5 = $.first_child(fragment_5);

									{
										var consequent_1 = ($$anchor) => {
											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, $.get(hello)));
											$.append($$anchor, text_2);
										};

										$.if(node_5, ($$render) => {
											if ($.get(hello)) $$render(consequent_1);
										});
									}

									$.append($$anchor, fragment_5);
								}
							}
						});

						var node_6 = $.sibling(node_4, 2);

						{
							var consequent_4 = ($$anchor) => {
								var fragment_7 = root();
								var node_7 = $.first_child(fragment_7);

								Comp(node_7, {
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$anchor, $$slotProps) => {
											const hello = $.derived(() => $$slotProps.hello);
											var fragment_8 = $.comment();
											var node_8 = $.first_child(fragment_8);

											{
												var consequent_2 = ($$anchor) => {
													var text_3 = $.text();

													$.template_effect(() => $.set_text(text_3, $.get(hello)));
													$.append($$anchor, text_3);
												};

												$.if(node_8, ($$render) => {
													if ($.get(hello)) $$render(consequent_2);
												});
											}

											$.append($$anchor, fragment_8);
										}
									}
								});

								var node_9 = $.sibling(node_7, 2);

								Comp(node_9, {
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$anchor, $$slotProps) => {
											const foo = $.derived(() => $$slotProps.foo);
											const hello = $.derived(() => $.get(foo));
											var fragment_10 = $.comment();
											var node_10 = $.first_child(fragment_10);

											{
												var consequent_3 = ($$anchor) => {
													var text_4 = $.text();

													$.template_effect(() => $.set_text(text_4, $.get(hello)));
													$.append($$anchor, text_4);
												};

												$.if(node_10, ($$render) => {
													if ($.get(hello)) $$render(consequent_3);
												});
											}

											$.append($$anchor, fragment_10);
										}
									}
								});

								$.append($$anchor, fragment_7);
							};

							$.if(node_6, ($$render) => {
								if ($.get(hello)) $$render(consequent_4);
							});
						}

						$.template_effect(() => $.set_text(text, `${$.get(hello) ?? ''} `));
						$.append($$anchor, fragment_2);
					},

					named1: ($$anchor, $$slotProps) => {
						const hello = $.derived(() => $$slotProps.hello);
						var fragment_12 = $.comment();
						var node_11 = $.first_child(fragment_12);

						{
							var consequent_5 = ($$anchor) => {
								var text_5 = $.text();

								$.template_effect(() => $.set_text(text_5, $.get(hello)));
								$.append($$anchor, text_5);
							};

							$.if(node_11, ($$render) => {
								if ($.get(hello)) $$render(consequent_5);
							});
						}

						$.append($$anchor, fragment_12);
					},

					named2: ($$anchor, $$slotProps) => {
						const hello = $.derived(() => $$slotProps.hello);
						var p = root_2();
						var node_12 = $.child(p);

						{
							var consequent_6 = ($$anchor) => {
								var text_6 = $.text();

								$.template_effect(() => $.set_text(text_6, $.get(hello)));
								$.append($$anchor, text_6);
							};

							$.if(node_12, ($$render) => {
								if ($.get(hello)) $$render(consequent_6);
							});
						}

						$.reset(p);
						$.append($$anchor, p);
					},

					named3: ($$anchor, $$slotProps) => {
						const hello = $.derived(() => $$slotProps.hello);

						Comp($$anchor, {
							slot: 'named3',
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$anchor, $$slotProps) => {
									var fragment_16 = $.comment();
									var node_13 = $.first_child(fragment_16);

									{
										var consequent_7 = ($$anchor) => {
											var text_7 = $.text();

											$.template_effect(() => $.set_text(text_7, $.get(hello)));
											$.append($$anchor, text_7);
										};

										$.if(node_13, ($$render) => {
											if ($.get(hello)) $$render(consequent_7);
										});
									}

									$.append($$anchor, fragment_16);
								}
							}
						});
					}
				}
			});

			var node_14 = $.sibling(node_1, 2);

			{
				var consequent_8 = ($$anchor) => {
					Comp($$anchor, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const bye = $.derived(() => $$slotProps.foo);

								$.next();

								var text_8 = $.text();

								$.template_effect(() => $.set_text(text_8, $.get(bye)));
								$.append($$anchor, text_8);
							}
						}
					});
				};

				var consequent_9 = ($$anchor) => {
					Comp($$anchor, {
						$$slots: {
							named: ($$anchor, $$slotProps) => {
								const cool = $.derived(() => $$slotProps.cool);
								const hello = $.derived(() => $$slotProps.hello);
								var div = root_3();
								var text_9 = $.only_child(div, true);

								$.template_effect(() => $.set_text(text_9, $.get(hello)));
								$.append($$anchor, div);
							}
						}
					});
				};

				var alternate = ($$anchor) => {
					Comp($$anchor, {
						$$slots: {
							named: ($$anchor, $$slotProps) => {
								const hello = $.derived(() => $$slotProps.foo);
								const other = $.derived(() => $$slotProps.hello1);
								var div_1 = root_3();
								var text_10 = $.only_child(div_1, true);

								$.template_effect(() => $.set_text(text_10, $.get(hello)));
								$.append($$anchor, div_1);
							}
						}
					});
				};

				$.if(node_14, ($$render) => {
					if (hi && bye) $$render(consequent_8); else if (cool) $$render(consequent_9, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (hello && hello1) $$render(consequent_10);
		});
	}

	var node_15 = $.sibling(node, 2);

	Comp(node_15, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const hello = $.derived(() => $$slotProps.hello);
				var fragment_22 = $.comment();
				var node_16 = $.first_child(fragment_22);

				{
					var consequent_11 = ($$anchor) => {
						var text_11 = $.text();

						$.template_effect(() => $.set_text(text_11, `${$.get(hello) ?? ''} ${bye ?? ''}`));
						$.append($$anchor, text_11);
					};

					var consequent_12 = ($$anchor) => {
						var text_12 = $.text();

						$.template_effect(() => $.set_text(text_12, `${$.get(hello) ?? ''} ${bye ?? ''}`));
						$.append($$anchor, text_12);
					};

					var alternate_1 = ($$anchor) => {
						var text_13 = $.text();

						$.template_effect(() => $.set_text(text_13, `${$.get(hello) ?? ''} ${bye ?? ''}`));
						$.append($$anchor, text_13);
					};

					$.if(node_16, ($$render) => {
						if ($.get(hello) && bye) $$render(consequent_11); else if ($.get(hello) && bye) $$render(consequent_12, 1); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_22);
			},

			named1: ($$anchor, $$slotProps) => {
				const hello = $.derived(() => $$slotProps.hello);
				var fragment_26 = $.comment();
				var node_17 = $.first_child(fragment_26);

				{
					var consequent_13 = ($$anchor) => {
						var text_14 = $.text();

						$.template_effect(() => $.set_text(text_14, `${$.get(hello) ?? ''} ${bye ?? ''}`));
						$.append($$anchor, text_14);
					};

					var consequent_14 = ($$anchor) => {
						var text_15 = $.text();

						$.template_effect(() => $.set_text(text_15, `${$.get(hello) ?? ''} ${bye ?? ''}`));
						$.append($$anchor, text_15);
					};

					var alternate_2 = ($$anchor) => {
						var text_16 = $.text();

						$.template_effect(() => $.set_text(text_16, `${$.get(hello) ?? ''} ${bye ?? ''}`));
						$.append($$anchor, text_16);
					};

					$.if(node_17, ($$render) => {
						if ($.get(hello) && bye) $$render(consequent_13); else if ($.get(hello) && bye) $$render(consequent_14, 1); else $$render(alternate_2, -1);
					});
				}

				$.append($$anchor, fragment_26);
			},

			named2: ($$anchor, $$slotProps) => {
				const hello = $.derived(() => $$slotProps.hello);
				var p_1 = root_2();
				var node_18 = $.child(p_1);

				{
					var consequent_15 = ($$anchor) => {
						var text_17 = $.text();

						$.template_effect(() => $.set_text(text_17, `${$.get(hello) ?? ''} ${bye ?? ''}`));
						$.append($$anchor, text_17);
					};

					var consequent_16 = ($$anchor) => {
						var text_18 = $.text();

						$.template_effect(() => $.set_text(text_18, `${$.get(hello) ?? ''} ${bye ?? ''}`));
						$.append($$anchor, text_18);
					};

					var alternate_3 = ($$anchor) => {
						var text_19 = $.text();

						$.template_effect(() => $.set_text(text_19, `${$.get(hello) ?? ''} ${bye ?? ''}`));
						$.append($$anchor, text_19);
					};

					$.if(node_18, ($$render) => {
						if ($.get(hello) && bye) $$render(consequent_15); else if ($.get(hello) && bye) $$render(consequent_16, 1); else $$render(alternate_3, -1);
					});
				}

				$.reset(p_1);
				$.append($$anchor, p_1);
			},

			named3: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => $$slotProps.foo);
				const hello = $.derived(() => $.get(foo));
				var p_2 = root_4();
				var node_19 = $.child(p_2);

				{
					var consequent_17 = ($$anchor) => {
						var text_20 = $.text();

						$.template_effect(() => $.set_text(text_20, `${$.get(hello) ?? ''} ${bye ?? ''}`));
						$.append($$anchor, text_20);
					};

					var consequent_18 = ($$anchor) => {
						var text_21 = $.text();

						$.template_effect(() => $.set_text(text_21, `${$.get(hello) ?? ''} ${bye ?? ''}`));
						$.append($$anchor, text_21);
					};

					var alternate_4 = ($$anchor) => {
						var text_22 = $.text();

						$.template_effect(() => $.set_text(text_22, `${$.get(hello) ?? ''} ${bye ?? ''}`));
						$.append($$anchor, text_22);
					};

					$.if(node_19, ($$render) => {
						if ($.get(hello) && bye) $$render(consequent_17); else if ($.get(hello) && bye) $$render(consequent_18, 1); else $$render(alternate_4, -1);
					});
				}

				$.reset(p_2);
				$.append($$anchor, p_2);
			}
		}
	});

	$.append($$anchor, fragment);
}