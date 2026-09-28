import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import CopyIcon from "@lucide/svelte/icons/copy";
import ShareIcon from "@lucide/svelte/icons/share";
import { scale } from "svelte/transition";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { OG_IMAGE_BASE_URL } from "$lib/../routes/og/og.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { buttonVariants, Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<!> Share`, 1);
var root_1 = $.from_html(`<div><!> <span class="sr-only">Copied</span></div>`);
var root_2 = $.from_html(`<div><!> <span class="sr-only">Copy</span></div>`);
var root_3 = $.from_html(`<div class="flex w-full flex-col items-start gap-2"><div class="h-[183px] w-full overflow-hidden rounded-lg border border-border bg-background"><img alt="og" class="size-full object-contain"/></div> <div class="flex w-full place-items-center items-center gap-2"><!> <!></div></div>`);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Share($$anchor, $$props) {
	$.push($$props, true);

	const designSystem = useDesignSystem();
	const clipboard = new UseClipboard();
	const ogSrc = $.derived(() => `${OG_IMAGE_BASE_URL}/create/og${new URL(designSystem.shareUrl).search}`);
	var fragment = root_4();
	var node = $.first_child(fragment);

	Button(node, {
		variant: 'outline',
		size: 'sm',
		class: 'md:hidden',
		onclick: () => clipboard.copy(designSystem.shareUrl),
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					CheckIcon($$anchor, {});
				};

				var alternate = ($$anchor) => {
					ShareIcon($$anchor, {});
				};

				$.if(node_1, ($$render) => {
					if (clipboard.copied) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	$.component(node_2, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_4();
				var node_3 = $.first_child(fragment_4);

				{
					let $0 = $.derived(() => cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden md:flex"));

					$.component(node_3, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_4 = $.first_child(fragment_5);

								ShareIcon(node_4, {});
								$.next();
								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_5 = $.sibling(node_3, 2);

				$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						align: 'end',
						class: 'w-96',
						children: ($$anchor, $$slotProps) => {
							var div = root_3();
							var div_1 = $.child(div);
							var img = $.only_child(div_1);
							var div_2 = $.sibling(div_1, 2);
							var node_6 = $.child(div_2);

							Input(node_6, {
								readonly: true,
								get value() {
									return designSystem.shareUrl;
								}
							});

							var node_7 = $.sibling(node_6, 2);

							Button(node_7, {
								variant: 'outline',
								size: 'icon',
								onclick: () => clipboard.copy(designSystem.shareUrl),
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_8 = $.first_child(fragment_6);

									{
										var consequent_1 = ($$anchor) => {
											var div_3 = root_1();
											var node_9 = $.child(div_3);

											CheckIcon(node_9, { tabindex: -1 });
											$.next(2);
											$.reset(div_3);
											$.transition(1, div_3, () => scale, () => ({ duration: 500, start: 0.85 }));
											$.append($$anchor, div_3);
										};

										var alternate_1 = ($$anchor) => {
											var div_4 = root_2();
											var node_10 = $.child(div_4);

											CopyIcon(node_10, { tabindex: -1 });
											$.next(2);
											$.reset(div_4);
											$.transition(1, div_4, () => scale, () => ({ duration: 500, start: 0.85 }));
											$.append($$anchor, div_4);
										};

										$.if(node_8, ($$render) => {
											if (clipboard.copied) $$render(consequent_1); else $$render(alternate_1, -1);
										});
									}

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							$.reset(div_2);
							$.reset(div);
							$.template_effect(() => $.set_attribute(img, 'src', $.get(ogSrc)));
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}