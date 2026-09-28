import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as InputGroup from "$lib/registry/ui/input-group/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid w-full max-w-sm gap-6"><!> <!> <!> <!></div>`);

export default function Input_group_text_demo($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
								InputGroup_Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('$');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, { placeholder: '0.00' });
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_5 = $.first_child(fragment_2);

							$.component(node_5, () => InputGroup.Text, ($$anchor, InputGroup_Text_1) => {
								InputGroup_Text_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('USD');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node, 2);

	$.component(node_6, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
		InputGroup_Root_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_7 = $.first_child(fragment_3);

				$.component(node_7, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
					InputGroup_Addon_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_8 = $.first_child(fragment_4);

							$.component(node_8, () => InputGroup.Text, ($$anchor, InputGroup_Text_2) => {
								InputGroup_Text_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('https://');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_7, 2);

				$.component(node_9, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
					InputGroup_Input_1($$anchor, { placeholder: 'example.com', class: '!ps-0.5' });
				});

				var node_10 = $.sibling(node_9, 2);

				$.component(node_10, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
					InputGroup_Addon_3($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_11 = $.first_child(fragment_5);

							$.component(node_11, () => InputGroup.Text, ($$anchor, InputGroup_Text_3) => {
								InputGroup_Text_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('.com');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_12 = $.sibling(node_6, 2);

	$.component(node_12, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
		InputGroup_Root_2($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_1();
				var node_13 = $.first_child(fragment_6);

				$.component(node_13, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
					InputGroup_Input_2($$anchor, { placeholder: 'Enter your username' });
				});

				var node_14 = $.sibling(node_13, 2);

				$.component(node_14, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_4) => {
					InputGroup_Addon_4($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_15 = $.first_child(fragment_7);

							$.component(node_15, () => InputGroup.Text, ($$anchor, InputGroup_Text_4) => {
								InputGroup_Text_4($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('@company.com');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	var node_16 = $.sibling(node_12, 2);

	$.component(node_16, () => InputGroup.Root, ($$anchor, InputGroup_Root_3) => {
		InputGroup_Root_3($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_8 = root_1();
				var node_17 = $.first_child(fragment_8);

				$.component(node_17, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea) => {
					InputGroup_Textarea($$anchor, { placeholder: 'Enter your message' });
				});

				var node_18 = $.sibling(node_17, 2);

				$.component(node_18, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_5) => {
					InputGroup_Addon_5($$anchor, {
						align: 'block-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = $.comment();
							var node_19 = $.first_child(fragment_9);

							$.component(node_19, () => InputGroup.Text, ($$anchor, InputGroup_Text_5) => {
								InputGroup_Text_5($$anchor, {
									class: 'text-xs text-muted-foreground',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('120 characters left');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_8);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}