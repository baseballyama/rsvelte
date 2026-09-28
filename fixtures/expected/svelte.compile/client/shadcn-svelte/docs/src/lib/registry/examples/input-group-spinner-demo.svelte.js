import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LoaderIcon from "@lucide/svelte/icons/loader";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid w-full max-w-sm gap-4"><!> <!> <!> <!></div>`);

export default function Input_group_spinner_demo($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			'data-disabled': true,
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, { placeholder: 'Searching...', disabled: true });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							Spinner($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
		InputGroup_Root_1($$anchor, {
			'data-disabled': true,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_4 = $.first_child(fragment_2);

				$.component(node_4, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
					InputGroup_Input_1($$anchor, { placeholder: 'Processing...', disabled: true });
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Spinner($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node_3, 2);

	$.component(node_6, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
		InputGroup_Root_2($$anchor, {
			'data-disabled': true,
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_7 = $.first_child(fragment_4);

				$.component(node_7, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
					InputGroup_Input_2($$anchor, { placeholder: 'Saving changes...', disabled: true });
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
					InputGroup_Addon_2($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_9 = $.first_child(fragment_5);

							$.component(node_9, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
								InputGroup_Text($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Saving...');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_9, 2);

							Spinner(node_10, {});
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	var node_11 = $.sibling(node_6, 2);

	$.component(node_11, () => InputGroup.Root, ($$anchor, InputGroup_Root_3) => {
		InputGroup_Root_3($$anchor, {
			'data-disabled': true,
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_1();
				var node_12 = $.first_child(fragment_6);

				$.component(node_12, () => InputGroup.Input, ($$anchor, InputGroup_Input_3) => {
					InputGroup_Input_3($$anchor, { placeholder: 'Refreshing data...', disabled: true });
				});

				var node_13 = $.sibling(node_12, 2);

				$.component(node_13, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
					InputGroup_Addon_3($$anchor, {
						children: ($$anchor, $$slotProps) => {
							LoaderIcon($$anchor, { class: 'animate-spin' });
						},
						$$slots: { default: true }
					});
				});

				var node_14 = $.sibling(node_13, 2);

				$.component(node_14, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_4) => {
					InputGroup_Addon_4($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_15 = $.first_child(fragment_8);

							$.component(node_15, () => InputGroup.Text, ($$anchor, InputGroup_Text_1) => {
								InputGroup_Text_1($$anchor, {
									class: 'text-muted-foreground',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Please wait...');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}