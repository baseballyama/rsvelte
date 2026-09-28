import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SquareLock01Icon, SquareUnlock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/svelte";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<!> <!>`, 1);

export default function Lock_button($$anchor, $$props) {
	$.push($$props, true);

	const designSystem = useDesignSystem();
	const isLocked = $.derived(() => designSystem.locks[$$props.prop]);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
		Tooltip_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn("flex size-4 cursor-pointer items-center justify-center rounded opacity-0 transition-opacity group-focus-within/picker:opacity-100 group-hover/picker:opacity-100 focus-visible:opacity-100 data-[locked=true]:opacity-100 pointer-coarse:hidden", $$props.class));
					let $1 = $.derived(() => $.get(isLocked) ? "Unlock" : "Lock");

					$.component(node_1, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
						Tooltip_Trigger($$anchor, {
							onclick: () => $.get(isLocked)
								? designSystem.unlock($$props.prop)
								: designSystem.lock($$props.prop),

							get 'data-locked'() {
								return $.get(isLocked);
							},

							get class() {
								return $.get($0);
							},

							get 'aria-label'() {
								return $.get($1);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								{
									var consequent = ($$anchor) => {
										HugeiconsIcon($$anchor, {
											get icon() {
												return SquareLock01Icon;
											},
											strokeWidth: 2,
											className: 'text-foreground size-5'
										});
									};

									var alternate = ($$anchor) => {
										HugeiconsIcon($$anchor, {
											get icon() {
												return SquareUnlock01Icon;
											},
											strokeWidth: 2,
											className: 'text-foreground size-5'
										});
									};

									$.if(node_2, ($$render) => {
										if ($.get(isLocked)) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
					Tooltip_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(isLocked) ? "Locked" : "Unlocked"));
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

	$.append($$anchor, fragment);
	$.pop();
}