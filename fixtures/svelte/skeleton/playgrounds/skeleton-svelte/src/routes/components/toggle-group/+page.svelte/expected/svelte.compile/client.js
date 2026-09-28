import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BoldIcon from '@lucide/svelte/icons/bold';
import CodeIcon from '@lucide/svelte/icons/code';
import Heading1Icon from '@lucide/svelte/icons/heading-1';
import Heading2Icon from '@lucide/svelte/icons/heading-2';
import Heading3Icon from '@lucide/svelte/icons/heading-3';
import ItalicIcon from '@lucide/svelte/icons/italic';
import LinkIcon from '@lucide/svelte/icons/link';
import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
import PencilIcon from '@lucide/svelte/icons/pencil';
import StrikethroughIcon from '@lucide/svelte/icons/strikethrough';
import { ToggleGroup } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-10"><header><h2 class="h2">App Bar</h2></header> <section class="space-y-4"><!></section> <section class="space-y-4"><h3 class="h3">Normalized</h3> <div class="grid grid-cols-[auto_auto_1fr] items-center gap-4"><button type="button" class="btn preset-filled-primary-500">Button</button> <!> <input type="text" class="input" placeholder="Example"/></div></section> <section class="space-y-4"><h3 class="h3">Toolbar</h3> <div class="inline-flex gap-2 preset-outlined-surface-200-800 p-2 rounded-base"><!> <!> <!> <button type="button" class="btn preset-filled">Export</button></div></section></div>`);

export default function _page($$anchor) {
	var div = root_2();
	var section = $.sibling($.child(div), 2);
	var node = $.child(section);

	ToggleGroup(node, {
		defaultValue: ['center'],
		multiple: true,
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
				ToggleGroup_Item($$anchor, {
					value: 'left',
					children: ($$anchor, $$slotProps) => {
						BoldIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
				ToggleGroup_Item_1($$anchor, {
					value: 'center',
					children: ($$anchor, $$slotProps) => {
						ItalicIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
				ToggleGroup_Item_2($$anchor, {
					value: 'right',
					children: ($$anchor, $$slotProps) => {
						StrikethroughIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_1 = $.sibling($.child(section_1), 2);
	var node_4 = $.sibling($.child(div_1), 2);

	ToggleGroup(node_4, {
		defaultValue: ['center'],
		multiple: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_5 = $.first_child(fragment_4);

			$.component(node_5, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_3) => {
				ToggleGroup_Item_3($$anchor, {
					value: 'left',
					children: ($$anchor, $$slotProps) => {
						BoldIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_5, 2);

			$.component(node_6, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_4) => {
				ToggleGroup_Item_4($$anchor, {
					value: 'center',
					children: ($$anchor, $$slotProps) => {
						ItalicIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_7 = $.sibling(node_6, 2);

			$.component(node_7, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_5) => {
				ToggleGroup_Item_5($$anchor, {
					value: 'right',
					children: ($$anchor, $$slotProps) => {
						StrikethroughIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_1);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var div_2 = $.sibling($.child(section_2), 2);
	var node_8 = $.child(div_2);

	ToggleGroup(node_8, {
		multiple: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root();
			var node_9 = $.first_child(fragment_8);

			$.component(node_9, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_6) => {
				ToggleGroup_Item_6($$anchor, {
					value: 'left',
					children: ($$anchor, $$slotProps) => {
						BoldIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_10 = $.sibling(node_9, 2);

			$.component(node_10, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_7) => {
				ToggleGroup_Item_7($$anchor, {
					value: 'center',
					children: ($$anchor, $$slotProps) => {
						ItalicIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_11 = $.sibling(node_10, 2);

			$.component(node_11, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_8) => {
				ToggleGroup_Item_8($$anchor, {
					value: 'right',
					children: ($$anchor, $$slotProps) => {
						StrikethroughIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_8, 2);

	ToggleGroup(node_12, {
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root();
			var node_13 = $.first_child(fragment_12);

			$.component(node_13, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_9) => {
				ToggleGroup_Item_9($$anchor, {
					value: 'h1',
					children: ($$anchor, $$slotProps) => {
						Heading1Icon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_14 = $.sibling(node_13, 2);

			$.component(node_14, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_10) => {
				ToggleGroup_Item_10($$anchor, {
					value: 'h2',
					children: ($$anchor, $$slotProps) => {
						Heading2Icon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_15 = $.sibling(node_14, 2);

			$.component(node_15, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_11) => {
				ToggleGroup_Item_11($$anchor, {
					value: 'h3',
					children: ($$anchor, $$slotProps) => {
						Heading3Icon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_12, 2);

	ToggleGroup(node_16, {
		children: ($$anchor, $$slotProps) => {
			var fragment_16 = root_1();
			var node_17 = $.first_child(fragment_16);

			$.component(node_17, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_12) => {
				ToggleGroup_Item_12($$anchor, {
					value: 'edit',
					children: ($$anchor, $$slotProps) => {
						PencilIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_18 = $.sibling(node_17, 2);

			$.component(node_18, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_13) => {
				ToggleGroup_Item_13($$anchor, {
					value: 'code',
					children: ($$anchor, $$slotProps) => {
						CodeIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_19 = $.sibling(node_18, 2);

			$.component(node_19, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_14) => {
				ToggleGroup_Item_14($$anchor, {
					value: 'link',
					children: ($$anchor, $$slotProps) => {
						LinkIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_20 = $.sibling(node_19, 2);

			$.component(node_20, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_15) => {
				ToggleGroup_Item_15($$anchor, {
					value: 'comment',
					children: ($$anchor, $$slotProps) => {
						MessageCircleIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_16);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_2);
	$.reset(section_2);
	$.reset(div);
	$.append($$anchor, div);
}