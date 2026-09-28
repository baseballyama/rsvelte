import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Menu3Icon from "@tabler/icons-svelte/icons/menu-3";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

function useActiveItem(getItemIds) {
	let activeId = $.state(null);
	const itemIds = $.derived(() => getItemIds().map((id) => id.replace("#", "")));

	$.user_effect(() => {
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					$.set(activeId, entry.target.id, true);
				}
			}
		});

		for (const id of $.get(itemIds) ?? []) {
			const element = document.getElementById(id);

			if (element) {
				observer.observe(element);
			}
		}

		return () => {
			for (const id of $.get(itemIds) ?? []) {
				const element = document.getElementById(id);

				if (element) {
					observer.unobserve(element);
				}
			}
		};
	});

	return {
		get current() {
			return $.get(activeId);
		}
	};
}

function flattenToc(items, depth = 0) {
	const result = [];

	for (const item of items) {
		result.push({ title: item.title, url: item.url, depth });

		if (item.items && item.items.length > 0) {
			result.push(...flattenToc(item.items, depth + 1));
		}
	}

	return result;
}

var root = $.from_html(`<!> On This Page`, 1);
var root_1 = $.from_html(`<a> </a>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<a class="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground data-[active=true]:text-foreground data-[depth=1]:ps-4 data-[depth=2]:ps-6"> </a>`);
var root_4 = $.from_html(`<div><p class="sticky top-0 h-6 bg-background text-xs text-muted-foreground">On This Page</p> <!></div>`);

export default function Docs_toc($$anchor, $$props) {
	$.push($$props, true);

	let variant = $.prop($$props, 'variant', 3, "list");
	const flattenedToc = $.derived(() => flattenToc($$props.toc.items ?? []));
	const itemIds = $.derived(() => $.get(flattenedToc).map((item) => item.url));
	const activeHeading = useActiveItem(() => $.get(itemIds));
	let open = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
						DropdownMenu_Root($$anchor, {
							get open() {
								return $.get(open);
							},

							set open($$value) {
								$.set(open, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_2();
								var node_3 = $.first_child(fragment_3);

								{
									const child = ($$anchor, $$arg0) => {
										let props = () => ($$arg0?.()).props;

										{
											let $0 = $.derived(() => cn("h-8 md:h-7", $$props.class));

											Button($$anchor, $.spread_props(props, {
												variant: 'outline',
												size: 'sm',
												get class() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_4 = $.first_child(fragment_5);

													Menu3Icon(node_4, {});
													$.next();
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											}));
										}
									};

									$.component(node_3, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
										DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
									});
								}

								var node_5 = $.sibling(node_3, 2);

								$.component(node_5, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
									DropdownMenu_Content($$anchor, {
										align: 'start',
										class: 'no-scrollbar max-h-[70svh]',
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = $.comment();
											var node_6 = $.first_child(fragment_6);

											$.each(node_6, 17, () => $.get(flattenedToc), (item) => item.url, ($$anchor, item) => {
												var fragment_7 = $.comment();
												var node_7 = $.first_child(fragment_7);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var a = root_1();

														$.attribute_effect(a, () => ({ href: $.get(item).url, ...props() }));

														var text = $.only_child(a, true);

														$.template_effect(() => $.set_text(text, $.get(item).title));
														$.append($$anchor, a);
													};

													$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
														DropdownMenu_Item($$anchor, {
															onSelect: () => $.set(open, false),
															get 'data-depth'() {
																return $.get(item).depth;
															},
															class: 'data-[depth=1]:ps-6 data-[depth=2]:ps-8',
															child,
															$$slots: { child: true }
														});
													});
												}

												$.append($$anchor, fragment_7);
											});

											$.append($$anchor, fragment_6);
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
				};

				var alternate = ($$anchor) => {
					var div = root_4();
					var node_8 = $.sibling($.child(div), 2);

					$.each(node_8, 17, () => $.get(flattenedToc), (item) => item.url, ($$anchor, item) => {
						var a_1 = root_3();
						var text_1 = $.only_child(a_1, true);

						$.template_effect(() => {
							$.set_attribute(a_1, 'href', $.get(item).url);
							$.set_attribute(a_1, 'data-active', $.get(item).url === `#${activeHeading.current}`);
							$.set_attribute(a_1, 'data-depth', $.get(item).depth);
							$.set_text(text_1, $.get(item).title);
						});

						$.append($$anchor, a_1);
					});

					$.reset(div);

					$.template_effect(($0) => $.set_class(div, 1, $0), [
						() => $.clsx(cn("flex flex-col gap-2 p-4 pt-0 text-sm", $$props.class))
					]);

					$.append($$anchor, div);
				};

				$.if(node_1, ($$render) => {
					if (variant() === "dropdown") $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(flattenedToc).length) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}