import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CopyIcon from "@lucide/svelte/icons/copy";
import CornerDownLeftIcon from "@lucide/svelte/icons/corner-down-left";
import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-code"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14,2 14,8 20,8"></polyline><path d="m10 13-2 2 2 2"></path><path d="m14 17 2-2-2-2"></path></svg> script.js`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`Run <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="grid w-full max-w-md gap-4"><!></div>`);

export default function Input_group_textarea($$anchor) {
	var div = root_4();
	var node = $.child(div);

	$.component(node, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						align: 'block-start',
						class: 'border-b',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
								InputGroup_Text($$anchor, {
									class: 'font-mono font-medium',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();

										$.next();
										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
								InputGroup_Button($$anchor, {
									class: 'ms-auto',
									size: 'icon-xs',
									children: ($$anchor, $$slotProps) => {
										RefreshCwIcon($$anchor, {});
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
								InputGroup_Button_1($$anchor, {
									variant: 'ghost',
									size: 'icon-xs',
									children: ($$anchor, $$slotProps) => {
										CopyIcon($$anchor, {});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea) => {
					InputGroup_Textarea($$anchor, {
						placeholder: 'console.log(\'Hello, world!\');',
						class: 'min-h-[200px]'
					});
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						align: 'block-end',
						class: 'border-t',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_3();
							var node_7 = $.first_child(fragment_5);

							$.component(node_7, () => InputGroup.Text, ($$anchor, InputGroup_Text_1) => {
								InputGroup_Text_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Line 1, Column 1');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => InputGroup.Button, ($$anchor, InputGroup_Button_2) => {
								InputGroup_Button_2($$anchor, {
									size: 'sm',
									class: 'ms-auto',
									variant: 'default',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_6 = root_2();
										var node_9 = $.sibling($.first_child(fragment_6));

										CornerDownLeftIcon(node_9, {});
										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}