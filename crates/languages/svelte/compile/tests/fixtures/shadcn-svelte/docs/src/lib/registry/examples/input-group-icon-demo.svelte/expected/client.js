import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import CreditCardIcon from "@lucide/svelte/icons/credit-card";
import InfoIcon from "@lucide/svelte/icons/info";
import MailIcon from "@lucide/svelte/icons/mail";
import SearchIcon from "@lucide/svelte/icons/search";
import StarIcon from "@lucide/svelte/icons/star";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid w-full max-w-sm gap-6"><!> <!> <!> <!></div>`);

export default function Input_group_icon_demo($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
					InputGroup_Input($$anchor, { placeholder: 'Search...' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						children: ($$anchor, $$slotProps) => {
							SearchIcon($$anchor, {});
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
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_4 = $.first_child(fragment_2);

				$.component(node_4, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
					InputGroup_Input_1($$anchor, { type: 'email', placeholder: 'Enter your email' });
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							MailIcon($$anchor, {});
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
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_1();
				var node_7 = $.first_child(fragment_4);

				$.component(node_7, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
					InputGroup_Input_2($$anchor, { placeholder: 'Card number' });
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
					InputGroup_Addon_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							CreditCardIcon($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_8, 2);

				$.component(node_9, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
					InputGroup_Addon_3($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							CheckIcon($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	var node_10 = $.sibling(node_6, 2);

	$.component(node_10, () => InputGroup.Root, ($$anchor, InputGroup_Root_3) => {
		InputGroup_Root_3($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root();
				var node_11 = $.first_child(fragment_7);

				$.component(node_11, () => InputGroup.Input, ($$anchor, InputGroup_Input_3) => {
					InputGroup_Input_3($$anchor, { placeholder: 'Card number' });
				});

				var node_12 = $.sibling(node_11, 2);

				$.component(node_12, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_4) => {
					InputGroup_Addon_4($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root();
							var node_13 = $.first_child(fragment_8);

							StarIcon(node_13, {});

							var node_14 = $.sibling(node_13, 2);

							InfoIcon(node_14, {});
							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}