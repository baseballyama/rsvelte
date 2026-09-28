import * as $ from 'svelte/internal/server';
import Dialog from "$lib/dialog/Dialog.svelte";
import Search from "$lib/forms/search/Search.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { commandPalette } from "./theme";

export default function CommandPalette($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const gid = $.props_id($$renderer);
		const styles = commandPalette();

		let {
			open = false,
			items = [],
			placeholder = "Type a command or search keywords ...",
			emptyMessage = "No results found.",
			shortcutKey = "k",
			vim = false,
			"aria-labelledby": ariaLabelledby,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("commandPalette"));
		let search = "";
		let selectedIndex = 0;
		let containerElement = void 0;
		let ulId = "command-palette-options-" + gid;

		const filteredItems = $.derived(() => {
			const searchLower = search.trim().toLowerCase();

			if (searchLower === "") return items;

			const check = (x) => x?.toLowerCase().includes(searchLower);

			return items.filter((item) => check(item.label) || check(item.description) || item.keywords?.some(check));
		});

		function handleKeydown(e) {
			if (!open) return;
			if (handleGlobalKeydown(e)) return;

			switch (e.key) {
				case "j":
					if (!vim || e.ctrlKey) break;

				// falls through
				case "ArrowDown":
					e.preventDefault();
					selectedIndex = Math.max(Math.min(selectedIndex + 1, filteredItems().length - 1), 0);
					scrollToSelected();
					break;

				case "k":
					if (!vim || e.ctrlKey) break;

				// falls through
				case "ArrowUp":
					e.preventDefault();
					selectedIndex = Math.max(selectedIndex - 1, 0);
					scrollToSelected();
					break;

				case "Enter":
					e.preventDefault();
					if (filteredItems()[selectedIndex]) {
						selectItem(filteredItems()[selectedIndex]);
					}
					break;
			}
		}

		function scrollToSelected() {
			if (!containerElement) return;

			const listElement = containerElement.querySelector("ul");

			if (!listElement) return;

			const selectedElement = listElement.querySelector(`#${CSS.escape(filteredItems()[selectedIndex]?.id)}`);

			if (!selectedElement) return;

			const listRect = listElement.getBoundingClientRect();
			const elementRect = selectedElement.getBoundingClientRect();

			if (elementRect.bottom > listRect.bottom) {
				selectedElement.scrollIntoView({ block: "end", behavior: "auto" });
			} else if (elementRect.top < listRect.top) {
				selectedElement.scrollIntoView({ block: "start", behavior: "auto" });
			}
		}

		function selectItem(item) {
			item.onselect();
			open = false;
			search = "";
			selectedIndex = 0;
		}

		const handleGlobalKeydown = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === shortcutKey) {
				e.preventDefault();
				open = !open;
				selectedIndex = 0;

				return true;
			}
		};

		function init(dlg) {
			containerElement = dlg;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Dialog($$renderer, $.spread_props([
				{
					dismissable: false,
					'aria-modal': 'true',
					'aria-labelledby': ariaLabelledby,
					tabindex: -1,
					class: styles.base({ class: clsx(theme()?.base, className) })
				},
				restProps,
				{
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Search($$renderer, {
							size: 'md',
							placeholder,
							classes: {
								input: styles.search({ class: clsx(theme()?.search, classes?.search) })
							},
							autofocus: true,
							role: 'combobox',
							'aria-expanded': 'true',
							'aria-controls': ulId,
							'aria-activedescendant': filteredItems()[selectedIndex]?.id,
							get value() {
								return search;
							},

							set value($$value) {
								search = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----> `);

						if (filteredItems().length > 0) {
							$$renderer.push(`<!--[0--><ul${$.attr('id', ulId)}${$.attr_class($.clsx(styles.list({ class: clsx(theme()?.list, classes?.list) })))} role="listbox"><!--[-->`);

							const each_array = $.ensure_array_like(filteredItems());

							for (let index = 0, $$length = each_array.length; index < $$length; index++) {
								let item = each_array[index];

								$$renderer.push(`<li${$.attr('data-index', index)}${$.attr('id', item.id)} role="option"${$.attr('aria-selected', index === selectedIndex)}${$.attr_class($.clsx(styles.item({
									selected: index === selectedIndex,
									class: clsx(theme()?.item, classes?.item)
								})))} tabindex="-1"><div class="flex items-center gap-3">`);

								if (item.icon) {
									$$renderer.push(`<!--[0--><span class="text-lg">${$.escape(item.icon)}</span>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> <div class="min-w-0 flex-1"><div class="truncate text-sm font-medium">${$.escape(item.label)}</div> `);

								if (item.description) {
									$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(styles.itemDescription({
										class: clsx(theme()?.itemDescription, classes?.itemDescription)
									})))}>${$.escape(item.description)}</div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div></div></li>`);
							}

							$$renderer.push(`<!--]--></ul>`);
						} else if (search) {
							$$renderer.push(`<!--[1--><div${$.attr_class($.clsx(styles.empty({ class: clsx(theme()?.empty, classes?.empty) })))}><p>${$.escape(emptyMessage)}</p></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(styles.footer({ class: clsx(theme()?.footer, classes?.footer) })))}><div class="flex items-center gap-4"><kbd${$.attr_class($.clsx(styles.kbd({ class: clsx(theme()?.kbd, classes?.kbd) })))}>`);

						if (vim) {
							$$renderer.push(`<!--[0--><span>j/k</span>`);
						} else {
							$$renderer.push(`<!--[-1--><span>↑↓</span>`);
						}

						$$renderer.push(`<!--]--> <span>Navigate</span></kbd> <kbd${$.attr_class($.clsx(styles.kbd({ class: clsx(theme()?.kbd, classes?.kbd) })))}><span>↵</span> <span>Select</span></kbd></div> <kbd${$.attr_class($.clsx(styles.kbd({ class: clsx(theme()?.kbd, classes?.kbd) })))}><span>ESC</span> <span>Close</span></kbd></div>`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { open });
	});
}