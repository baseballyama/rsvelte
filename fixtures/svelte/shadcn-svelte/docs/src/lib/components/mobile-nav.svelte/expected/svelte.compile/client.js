import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Popover from "$lib/registry/ui/popover/index.js";
import { mainNavItems, PAGES_NEW, sidebarNavItems } from "$lib/navigation.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<span class="flex size-2 rounded-full bg-svelte-orange" title="New"></span>`);
var root_1 = $.from_html(`<a> <!></a>`);
var root_2 = $.from_html(`<div class="relative flex h-8 w-4 items-center justify-center"><div class="relative size-4"><span></span> <span></span></div> <span class="sr-only">Toggle Menu</span></div> <span class="flex h-8 items-center text-lg leading-none font-medium">Menu</span>`, 1);
var root_3 = $.from_html(`<div class="flex flex-col gap-4"><div class="text-sm font-medium text-muted-foreground"> </div> <div class="flex flex-col gap-3"></div></div>`);
var root_4 = $.from_html(`<div class="flex flex-col gap-12 overflow-auto px-6 py-6"><div class="flex flex-col gap-4"><div class="text-sm font-medium text-muted-foreground">Menu</div> <div class="flex flex-col gap-3"></div></div> <div class="flex flex-col gap-8"></div></div>`);
var root_5 = $.from_html(`<!> <!>`, 1);

export default function Mobile_nav($$anchor, $$props) {
	$.push($$props, true);

	const // Expose a function to close the mobile menu
	MobileLink = ($$anchor, $$arg0) => {
		let href = () => ($$arg0?.()).href;
		let content = () => ($$arg0?.()).content;
		let className = () => ($$arg0?.()).class;
		let props = () => $.exclude_from_object($$arg0?.(), ['href', 'content', 'class']);
		var a = root_1();

		var event_handler = () => {
			$.set(open, false);
		};

		$.attribute_effect(a, ($0) => ({ href: href(), onclick: event_handler, class: $0, ...props() }), [
			() => cn("flex items-center gap-2 text-2xl font-medium", className())
		]);

		var text = $.child(a);
		var node = $.sibling(text);

		{
			var consequent = ($$anchor) => {
				var span = root();

				$.append($$anchor, span);
			};

			var d = $.derived(() => href() && PAGES_NEW.includes(href()));

			$.if(node, ($$render) => {
				if ($.get(d)) $$render(consequent);
			});
		}

		$.reset(a);
		$.template_effect(() => $.set_text(text, `${content() ?? ''} `));
		$.append($$anchor, a);
	};

	let restProps = $.rest_props($$props, rest_excludes);
	let open = $.state(false);

	let closeMenu = () => {
		$.set(open, false);
	};

	var $$exports = {
		get closeMenu() {
			return closeMenu;
		},

		set closeMenu($$value) {
			closeMenu = $$value;
		}
	};

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	$.component(node_1, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_5();
				var node_2 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						{
							let $0 = $.derived(() => cn("extend-touch-target h-8 touch-manipulation items-center justify-start gap-2.5 !p-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:!translate-y-0 active:bg-transparent active:!opacity-100 data-[state=open]:bg-transparent dark:hover:bg-transparent", $$props.class));

							Button($$anchor, $.spread_props(props, () => restProps, {
								variant: 'ghost',
								get class() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var div = $.first_child(fragment_3);
									var div_1 = $.child(div);
									var span_1 = $.child(div_1);
									var span_2 = $.sibling(span_1, 2);

									$.reset(div_1);
									$.next(2);
									$.reset(div);
									$.next(2);

									$.template_effect(
										($0, $1) => {
											$.set_class(span_1, 1, $0);
											$.set_class(span_2, 1, $1);
										},
										[
											() => $.clsx(cn("absolute start-0 block h-0.5 w-4 bg-foreground transition-all duration-100", $.get(open) ? "top-[0.4rem] -rotate-45" : "top-1")),
											() => $.clsx(cn("absolute start-0 block h-0.5 w-4 bg-foreground transition-all duration-100", $.get(open) ? "top-[0.4rem] rotate-45" : "top-2.5"))
										]
									);

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							}));
						}
					};

					$.component(node_2, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'no-scrollbar h-(--bits-popover-content-available-height) w-(--bits-popover-content-available-width) overflow-y-auto rounded-none border-none bg-background/90 p-0 shadow-none backdrop-blur duration-100',
						align: 'start',
						side: 'bottom',
						alignOffset: -16,
						sideOffset: 14,
						preventScroll: true,
						children: ($$anchor, $$slotProps) => {
							var div_2 = root_4();
							var div_3 = $.child(div_2);
							var div_4 = $.sibling($.child(div_3), 2);

							$.each(div_4, 21, () => mainNavItems, $.index, ($$anchor, item) => {
								MobileLink($$anchor, () => ({ href: $.get(item).href, content: $.get(item).title }));
							});

							$.reset(div_4);
							$.reset(div_3);

							var div_5 = $.sibling(div_3, 2);

							$.each(div_5, 21, () => sidebarNavItems, (group) => group.title, ($$anchor, group) => {
								var div_6 = root_3();
								var div_7 = $.child(div_6);
								var text_1 = $.only_child(div_7, true);
								var div_8 = $.sibling(div_7, 2);

								$.each(div_8, 21, () => $.get(group).items, $.index, ($$anchor, item) => {
									MobileLink($$anchor, () => ({ href: $.get(item).href, content: $.get(item).title }));
								});

								$.reset(div_8);
								$.reset(div_6);
								$.template_effect(() => $.set_text(text_1, $.get(group).title));
								$.append($$anchor, div_6);
							});

							$.reset(div_5);
							$.reset(div_2);
							$.append($$anchor, div_2);
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

	return $.pop($$exports);
}