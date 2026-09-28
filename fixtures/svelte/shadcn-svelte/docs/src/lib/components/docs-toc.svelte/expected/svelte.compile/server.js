import * as $ from 'svelte/internal/server';
import Menu3Icon from "@tabler/icons-svelte/icons/menu-3";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

function useActiveItem(getItemIds) {
	let activeId = null;
	const itemIds = $.derived(() => getItemIds().map((id) => id.replace("#", "")));

	return {
		get current() {
			return activeId;
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

export default function Docs_toc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { toc, variant = "list", class: className } = $$props;
		const flattenedToc = $.derived(() => flattenToc(toc.items ?? []));
		const itemIds = $.derived(() => flattenedToc().map((item) => item.url));
		const activeHeading = useActiveItem(() => itemIds());
		let open = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (flattenedToc().length) {
				$$renderer.push('<!--[0-->');

				if (variant === "dropdown") {
					$$renderer.push('<!--[0-->');

					if (DropdownMenu.Root) {
						$$renderer.push('<!--[-->');

						DropdownMenu.Root($$renderer, {
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
											{
												variant: 'outline',
												size: 'sm',
												class: cn("h-8 md:h-7", className),
												children: ($$renderer) => {
													Menu3Icon($$renderer, {});
													$$renderer.push(`<!----> On This Page`);
												},
												$$slots: { default: true }
											}
										]));
									}

									if (DropdownMenu.Trigger) {
										$$renderer.push('<!--[-->');
										DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(` `);

								if (DropdownMenu.Content) {
									$$renderer.push('<!--[-->');

									DropdownMenu.Content($$renderer, {
										align: 'start',
										class: 'no-scrollbar max-h-[70svh]',
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(flattenedToc());

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let item = each_array[$$index];

												{
													function child($$renderer, { props }) {
														$$renderer.push(`<a${$.attributes({ href: item.url, ...props })}>${$.escape(item.title)}</a>`);
													}

													if (DropdownMenu.Item) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Item($$renderer, {
															onSelect: () => open = false,
															'data-depth': item.depth,
															class: 'data-[depth=1]:ps-6 data-[depth=2]:ps-8',
															child,
															$$slots: { child: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(cn("flex flex-col gap-2 p-4 pt-0 text-sm", className)))}><p class="sticky top-0 h-6 bg-background text-xs text-muted-foreground">On This Page</p> <!--[-->`);

					const each_array_1 = $.ensure_array_like(flattenedToc());

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let item = each_array_1[$$index_1];

						$$renderer.push(`<a${$.attr('href', item.url)} class="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground data-[active=true]:text-foreground data-[depth=1]:ps-4 data-[depth=2]:ps-6"${$.attr('data-active', item.url === `#${activeHeading.current}`)}${$.attr('data-depth', item.depth)}>${$.escape(item.title)}</a>`);
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}