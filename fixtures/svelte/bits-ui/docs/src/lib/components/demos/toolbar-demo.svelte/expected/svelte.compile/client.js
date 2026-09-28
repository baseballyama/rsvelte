import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Separator, Toolbar } from "bits-ui";
import Sparkle from "phosphor-svelte/lib/Sparkle";
import TextAlignCenter from "phosphor-svelte/lib/TextAlignCenter";
import TextAlignLeft from "phosphor-svelte/lib/TextAlignLeft";
import TextAlignRight from "phosphor-svelte/lib/TextAlignRight";
import TextB from "phosphor-svelte/lib/TextB";
import TextItalic from "phosphor-svelte/lib/TextItalic";
import TextStrikethrough from "phosphor-svelte/lib/TextStrikethrough";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <span>Ask AI</span>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <div class="flex items-center"><!></div>`, 1);

export default function Toolbar_demo($$anchor) {
	let text = $.state($.proxy(["bold"]));
	let align = $.state("");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Toolbar.Root, ($$anchor, Toolbar_Root) => {
		Toolbar_Root($$anchor, {
			class: 'rounded-10px border-border bg-background-alt shadow-mini flex h-12 min-w-max items-center justify-center border px-[4px] py-1',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Toolbar.Group, ($$anchor, Toolbar_Group) => {
					Toolbar_Group($$anchor, {
						type: 'multiple',
						class: 'flex items-center gap-x-0.5',
						get value() {
							return $.get(text);
						},

						set value($$value) {
							$.set(text, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem) => {
								Toolbar_GroupItem($$anchor, {
									'aria-label': 'toggle bold',
									value: 'bold',
									class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
									children: ($$anchor, $$slotProps) => {
										TextB($$anchor, { class: 'size-6' });
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_1) => {
								Toolbar_GroupItem_1($$anchor, {
									'aria-label': 'toggle italic',
									value: 'italic',
									class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
									children: ($$anchor, $$slotProps) => {
										TextItalic($$anchor, { class: 'size-6' });
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_2) => {
								Toolbar_GroupItem_2($$anchor, {
									'aria-label': 'toggle strikethrough',
									value: 'strikethrough',
									class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
									children: ($$anchor, $$slotProps) => {
										TextStrikethrough($$anchor, { class: 'size-6' });
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Separator.Root, ($$anchor, Separator_Root) => {
					Separator_Root($$anchor, { class: 'bg-dark-10 -my-1 mx-1 w-[1px] self-stretch' });
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => Toolbar.Group, ($$anchor, Toolbar_Group_1) => {
					Toolbar_Group_1($$anchor, {
						type: 'single',
						class: 'flex items-center gap-x-0.5',
						get value() {
							return $.get(align);
						},

						set value($$value) {
							$.set(align, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_7 = $.first_child(fragment_6);

							$.component(node_7, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_3) => {
								Toolbar_GroupItem_3($$anchor, {
									'aria-label': 'align left',
									value: 'left',
									class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
									children: ($$anchor, $$slotProps) => {
										TextAlignLeft($$anchor, { class: 'size-6' });
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_4) => {
								Toolbar_GroupItem_4($$anchor, {
									'aria-label': 'align center',
									value: 'center',
									class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
									children: ($$anchor, $$slotProps) => {
										TextAlignCenter($$anchor, { class: 'size-6' });
									},
									$$slots: { default: true }
								});
							});

							var node_9 = $.sibling(node_8, 2);

							$.component(node_9, () => Toolbar.GroupItem, ($$anchor, Toolbar_GroupItem_5) => {
								Toolbar_GroupItem_5($$anchor, {
									'aria-label': 'align right',
									value: 'right',
									class: 'rounded-9px bg-background-alt text-foreground/60 hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=on]:text-foreground/80 active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
									children: ($$anchor, $$slotProps) => {
										TextAlignRight($$anchor, { class: 'size-6' });
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_6, 2);

				$.component(node_10, () => Separator.Root, ($$anchor, Separator_Root_1) => {
					Separator_Root_1($$anchor, { class: 'bg-dark-10 -my-1 mx-1 w-[1px] self-stretch' });
				});

				var div = $.sibling(node_10, 2);
				var node_11 = $.child(div);

				$.component(node_11, () => Toolbar.Button, ($$anchor, Toolbar_Button) => {
					Toolbar_Button($$anchor, {
						class: 'rounded-9px text-foreground/80 hover:bg-muted active:bg-dark-10 inline-flex items-center justify-center  px-3 py-2 text-sm font-medium transition-all active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_1();
							var node_12 = $.first_child(fragment_10);

							Sparkle(node_12, { class: 'mr-2 size-6' });
							$.next(2);
							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}