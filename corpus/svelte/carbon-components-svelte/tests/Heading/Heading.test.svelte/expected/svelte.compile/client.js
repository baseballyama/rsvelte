import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Heading from "carbon-components-svelte/Heading/Heading.svelte";
import Section from "carbon-components-svelte/Heading/Section.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <div data-testid="custom-tag-wrapper"><!></div> <!>`, 1);

export default function Heading_test($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Section(node, {
		children: ($$anchor, $$slotProps) => {
			Heading($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Default Heading 1');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Section(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_2 = $.first_child(fragment_2);

			Heading(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Nested Heading 1');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Section(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_4 = $.first_child(fragment_3);

					Heading(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Nested Heading 2');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Section(node_5, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_6 = $.first_child(fragment_4);

							Heading(node_6, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Nested Heading 3');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Section(node_7, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_8 = $.first_child(fragment_5);

									Heading(node_8, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Nested Heading 4');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_8, 2);

									Section(node_9, {
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root();
											var node_10 = $.first_child(fragment_6);

											Heading(node_10, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Nested Heading 5');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});

											var node_11 = $.sibling(node_10, 2);

											Section(node_11, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root();
													var node_12 = $.first_child(fragment_7);

													Heading(node_12, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Nested Heading 6');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});

													var node_13 = $.sibling(node_12, 2);

													Section(node_13, {
														children: ($$anchor, $$slotProps) => {
															Heading($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_7 = $.text('Nested Capped at Heading 6');

																	$.append($$anchor, text_7);
																},
																$$slots: { default: true }
															});
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_3, 2);

			Section(node_14, {
				children: ($$anchor, $$slotProps) => {
					Heading($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Sibling Heading 2');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_1, 2);

	Section(node_15, {
		level: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root();
			var node_16 = $.first_child(fragment_10);

			Heading(node_16, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Custom Level Heading 5');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_16, 2);

			Section(node_17, {
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root();
					var node_18 = $.first_child(fragment_11);

					Heading(node_18, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Custom Level Heading 6');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);

					Section(node_19, {
						children: ($$anchor, $$slotProps) => {
							Heading($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_11 = $.text('Custom Level Capped at Heading 6');

									$.append($$anchor, text_11);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node_15, 2);
	var node_20 = $.child(div);

	Section(node_20, {
		tag: 'div',
		children: ($$anchor, $$slotProps) => {
			Heading($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Custom Tag Heading 1');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_21 = $.sibling(div, 2);

	Heading(node_21, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_13 = $.text('Heading without Section');

			$.append($$anchor, text_13);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}