import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DiceFaces05Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/svelte";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<div class="flex flex-col justify-start text-left"><div class="text-xs text-muted-foreground">Shuffle</div> <div class="text-sm font-medium text-foreground">Try Random</div></div> <!> <!>`, 1);
var root_1 = $.from_html(`<span class="w-full text-center font-medium">Shuffle</span>`);

export default function Random_button($$anchor, $$props) {
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
						return designSystem.randomize;
					},
					closeOnSelect: false,
					class: 'h-[calc(--spacing(13.5))] w-[140px] touch-manipulation justify-between rounded-xl border border-foreground/10 bg-muted/50 select-none focus-visible:border-transparent focus-visible:ring-1 sm:rounded-lg md:w-full md:rounded-lg md:border-transparent md:bg-transparent md:pr-3.5! md:pl-2!',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.sibling($.first_child(fragment_2), 2);

						HugeiconsIcon(node_2, {
							get icon() {
								return DiceFaces05Icon;
							},
							className: 'size-5 md:hidden'
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Kbd.Root, ($$anchor, Kbd_Root) => {
							Kbd_Root($$anchor, {
								class: 'hidden bg-foreground/10 text-foreground md:flex',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('R');

									$.append($$anchor, text);
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
				variant: 'outline',
				get onclick() {
					return designSystem.randomize;
				},
				class: 'flex-1 touch-manipulation bg-transparent! px-2! py-0! text-sm! transition-none select-none hover:bg-muted! md:flex-none pointer-coarse:h-10!',
				children: ($$anchor, $$slotProps) => {
					var span = root_1();

					$.append($$anchor, span);
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