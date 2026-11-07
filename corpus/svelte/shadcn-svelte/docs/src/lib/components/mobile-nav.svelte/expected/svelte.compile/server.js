import * as $ from 'svelte/internal/server';
import * as Popover from "$lib/registry/ui/popover/index.js";
import { mainNavItems, PAGES_NEW, sidebarNavItems } from "$lib/navigation.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Mobile_nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;
		let open = false;

		// Expose a function to close the mobile menu
		let closeMenu = () => {
			open = false;
		};

		function MobileLink($$renderer, { href, content, class: className, ...props }) {
			$$renderer.push(`<a${$.attributes({
				href,
				class: $.clsx(cn("flex items-center gap-2 text-2xl font-medium", className)),
				...props
			})}>${$.escape(content)} `);

			if (href && PAGES_NEW.includes(href)) {
				$$renderer.push(`<!--[0--><span class="flex size-2 rounded-full bg-svelte-orange" title="New"></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></a>`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									restProps,
									{
										variant: 'ghost',
										class: cn("extend-touch-target h-8 touch-manipulation items-center justify-start gap-2.5 !p-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:!translate-y-0 active:bg-transparent active:!opacity-100 data-[state=open]:bg-transparent dark:hover:bg-transparent", className),
										children: ($$renderer) => {
											$$renderer.push(`<div class="relative flex h-8 w-4 items-center justify-center"><div class="relative size-4"><span${$.attr_class($.clsx(cn("absolute start-0 block h-0.5 w-4 bg-foreground transition-all duration-100", open ? "top-[0.4rem] -rotate-45" : "top-1")))}></span> <span${$.attr_class($.clsx(cn("absolute start-0 block h-0.5 w-4 bg-foreground transition-all duration-100", open ? "top-[0.4rem] rotate-45" : "top-2.5")))}></span></div> <span class="sr-only">Toggle Menu</span></div> <span class="flex h-8 items-center text-lg leading-none font-medium">Menu</span>`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');
								Popover.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								class: 'no-scrollbar h-(--bits-popover-content-available-height) w-(--bits-popover-content-available-width) overflow-y-auto rounded-none border-none bg-background/90 p-0 shadow-none backdrop-blur duration-100',
								align: 'start',
								side: 'bottom',
								alignOffset: -16,
								sideOffset: 14,
								preventScroll: true,
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex flex-col gap-12 overflow-auto px-6 py-6"><div class="flex flex-col gap-4"><div class="text-sm font-medium text-muted-foreground">Menu</div> <div class="flex flex-col gap-3"><!--[-->`);

									const each_array = $.ensure_array_like(mainNavItems);

									for (let i = 0, $$length = each_array.length; i < $$length; i++) {
										let item = each_array[i];

										MobileLink($$renderer, { href: item.href, content: item.title });
									}

									$$renderer.push(`<!--]--></div></div> <div class="flex flex-col gap-8"><!--[-->`);

									const each_array_1 = $.ensure_array_like(sidebarNavItems);

									for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
										let group = each_array_1[$$index_2];

										$$renderer.push(`<div class="flex flex-col gap-4"><div class="text-sm font-medium text-muted-foreground">${$.escape(group.title)}</div> <div class="flex flex-col gap-3"><!--[-->`);

										const each_array_2 = $.ensure_array_like(group.items);

										for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
											let item = each_array_2[i];

											MobileLink($$renderer, { href: item.href, content: item.title });
										}

										$$renderer.push(`<!--]--></div></div>`);
									}

									$$renderer.push(`<!--]--></div></div>`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { closeMenu });
	});
}