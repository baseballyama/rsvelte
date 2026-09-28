import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Undo02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/svelte";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Reset</div> <div class="text-sm font-medium text-foreground">Start Over</div></div> <!>`, 1);

export default function Reset_button($$anchor, $$props) {
	$.push($$props, true);

	let submenu = $.prop($$props, 'submenu', 3, false);
	const designSystem = useDesignSystem();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
				DropdownMenu_Item($$anchor, {
					get onSelect() {
						return designSystem.reset;
					},
					closeOnSelect: false,
					class: 'h-[calc(--spacing(13.5))] w-[140px] touch-manipulation justify-between rounded-xl border border-foreground/10 bg-muted/50 select-none focus-visible:border-transparent focus-visible:ring-1 sm:rounded-lg md:w-full md:rounded-lg md:border-transparent md:bg-transparent md:pr-3.5! md:pl-2!',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_2 = $.sibling($.first_child(fragment_2), 2);

						$.component(node_2, () => Kbd.Group, ($$anchor, Kbd_Group) => {
							Kbd_Group($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Kbd.Root, ($$anchor, Kbd_Root) => {
										Kbd_Root($$anchor, {
											class: 'hidden bg-foreground/10 text-foreground md:flex',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('⇧');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Kbd.Root, ($$anchor, Kbd_Root_1) => {
										Kbd_Root_1($$anchor, {
											class: 'hidden bg-foreground/10 text-foreground md:flex',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('R');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			Button($$anchor, {
				variant: 'ghost',
				size: 'sm',
				get onclick() {
					return designSystem.reset;
				},
				class: 'h-[calc(--spacing(13.5))] w-[140px] touch-manipulation justify-between rounded-xl border border-foreground/10 bg-muted/50 select-none focus-visible:border-transparent focus-visible:ring-1 sm:rounded-lg md:w-full md:rounded-lg md:border-transparent md:bg-transparent md:pr-3.5! md:pl-2!',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_1();
					var node_5 = $.sibling($.first_child(fragment_5), 2);

					HugeiconsIcon(node_5, {
						get icon() {
							return Undo02Icon;
						},
						className: '-translate-x-0.5'
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (submenu()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}