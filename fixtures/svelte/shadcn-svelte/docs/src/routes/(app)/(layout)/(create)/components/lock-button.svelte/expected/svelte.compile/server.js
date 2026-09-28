import * as $ from 'svelte/internal/server';
import { SquareLock01Icon, SquareUnlock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/svelte";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { cn } from "$lib/utils.js";

export default function Lock_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { prop, class: className } = $$props;
		const designSystem = useDesignSystem();
		const isLocked = $.derived(() => designSystem.locks[prop]);

		if (Tooltip.Root) {
			$$renderer.push('<!--[-->');

			Tooltip.Root($$renderer, {
				children: ($$renderer) => {
					if (Tooltip.Trigger) {
						$$renderer.push('<!--[-->');

						Tooltip.Trigger($$renderer, {
							onclick: () => isLocked() ? designSystem.unlock(prop) : designSystem.lock(prop),
							'data-locked': isLocked(),
							class: cn("flex size-4 cursor-pointer items-center justify-center rounded opacity-0 transition-opacity group-focus-within/picker:opacity-100 group-hover/picker:opacity-100 focus-visible:opacity-100 data-[locked=true]:opacity-100 pointer-coarse:hidden", className),
							'aria-label': isLocked() ? "Unlock" : "Lock",
							children: ($$renderer) => {
								if (isLocked()) {
									$$renderer.push('<!--[0-->');

									HugeiconsIcon($$renderer, {
										icon: SquareLock01Icon,
										strokeWidth: 2,
										className: 'text-foreground size-5'
									});
								} else {
									$$renderer.push('<!--[-1-->');

									HugeiconsIcon($$renderer, {
										icon: SquareUnlock01Icon,
										strokeWidth: 2,
										className: 'text-foreground size-5'
									});
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Tooltip.Content) {
						$$renderer.push('<!--[-->');

						Tooltip.Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(isLocked() ? "Locked" : "Unlocked")}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}