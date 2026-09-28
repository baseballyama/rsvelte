import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog from "$lib/dialog/Dialog.svelte";
import Search from "$lib/forms/search/Search.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { commandPalette } from "./theme";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'items',
	'placeholder',
	'emptyMessage',
	'shortcutKey',
	'vim',
	'aria-labelledby',
	'class',
	'classes'
]);

var root = $.from_html(`<span class="text-lg"> </span>`);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<li role="option" tabindex="-1"><div class="flex items-center gap-3"><!> <div class="min-w-0 flex-1"><div class="truncate text-sm font-medium"> </div> <!></div></div></li>`);
var root_3 = $.from_html(`<ul role="listbox"></ul>`);
var root_4 = $.from_html(`<div><p> </p></div>`);
var root_5 = $.from_html(`<span>j/k</span>`);
var root_6 = $.from_html(`<span>↑↓</span>`);
var root_7 = $.from_html(`<!> <!> <div><div class="flex items-center gap-4"><kbd><!> <span>Navigate</span></kbd> <kbd><span>↵</span> <span>Select</span></kbd></div> <kbd><span>ESC</span> <span>Close</span></kbd></div>`, 1);

export default function CommandPalette($$anchor, $$props) {
	const gid = $.props_id();

	$.push($$props, true);

	const styles = commandPalette();

	let open = $.prop($$props, 'open', 15, false),
		items = $.prop($$props, 'items', 19, () => []),
		placeholder = $.prop($$props, 'placeholder', 3, "Type a command or search keywords ..."),
		emptyMessage = $.prop($$props, 'emptyMessage', 3, "No results found."),
		shortcutKey = $.prop($$props, 'shortcutKey', 3, "k"),
		vim = $.prop($$props, 'vim', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("commandPalette"));
	let search = $.state("");
	let selectedIndex = $.state(0);
	let containerElement = $.state(void 0);
	let ulId = "command-palette-options-" + gid;

	const filteredItems = $.derived(() => {
		const searchLower = $.get(search).trim().toLowerCase();

		if (searchLower === "") return items();

		const check = (x) => x?.toLowerCase().includes(searchLower);

		return items().filter((item) => check(item.label) || check(item.description) || item.keywords?.some(check));
	});

	$.user_effect(() => {
		if ($.get(filteredItems).length > 0 && $.get(selectedIndex) >= $.get(filteredItems).length) {
			$.set(selectedIndex, Math.max($.get(filteredItems).length - 1, 0), true);
		}
	});

	function handleKeydown(e) {
		if (!open()) return;
		if (handleGlobalKeydown(e)) return;

		switch (e.key) {
			case "j":
				if (!vim() || e.ctrlKey) break;

			// falls through
			case "ArrowDown":
				e.preventDefault();
				$.set(selectedIndex, Math.max(Math.min($.get(selectedIndex) + 1, $.get(filteredItems).length - 1), 0), true);
				scrollToSelected();
				break;

			case "k":
				if (!vim() || e.ctrlKey) break;

			// falls through
			case "ArrowUp":
				e.preventDefault();
				$.set(selectedIndex, Math.max($.get(selectedIndex) - 1, 0), true);
				scrollToSelected();
				break;

			case "Enter":
				e.preventDefault();
				if ($.get(filteredItems)[$.get(selectedIndex)]) {
					selectItem($.get(filteredItems)[$.get(selectedIndex)]);
				}
				break;
		}
	}

	function scrollToSelected() {
		if (!$.get(containerElement)) return;

		const listElement = $.get(containerElement).querySelector("ul");

		if (!listElement) return;

		const selectedElement = listElement.querySelector(`#${CSS.escape($.get(filteredItems)[$.get(selectedIndex)]?.id)}`);

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
		open(false);
		$.set(search, "");
		$.set(selectedIndex, 0);
	}

	const handleGlobalKeydown = (e) => {
		if ((e.metaKey || e.ctrlKey) && e.key === shortcutKey()) {
			e.preventDefault();
			open(!open());
			$.set(selectedIndex, 0);

			return true;
		}
	};

	function init(dlg) {
		$.set(containerElement, dlg, true);
	}

	$.event('keydown', $.window, function (...$$args) {
		(open() ? handleKeydown : handleGlobalKeydown)?.apply(this, $$args);
	});

	{
		let $0 = $.derived(() => styles.base({ class: clsx($.get(theme)?.base, $$props.class) }));

		Dialog($$anchor, $.spread_props(
			{
				dismissable: false,
				[$.attachment()]: init,
				'aria-modal': 'true',
				get 'aria-labelledby'() {
					return $$props['aria-labelledby'];
				},
				tabindex: -1,
				get class() {
					return $.get($0);
				}
			},
			() => restProps,
			{
				get open() {
					return open();
				},

				set open($$value) {
					open($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_7();
					var node = $.first_child(fragment_1);

					{
						let $0 = $.derived(() => ({
							input: styles.search({ class: clsx($.get(theme)?.search, $$props.classes?.search) })
						}));

						let $1 = $.derived(() => $.get(filteredItems)[$.get(selectedIndex)]?.id);

						Search(node, {
							size: 'md',
							get placeholder() {
								return placeholder();
							},

							get classes() {
								return $.get($0);
							},
							autofocus: true,
							role: 'combobox',
							'aria-expanded': 'true',
							get 'aria-controls'() {
								return ulId;
							},

							get 'aria-activedescendant'() {
								return $.get($1);
							},

							get value() {
								return $.get(search);
							},

							set value($$value) {
								$.set(search, $$value, true);
							}
						});
					}

					var node_1 = $.sibling(node, 2);

					{
						var consequent_2 = ($$anchor) => {
							var ul = root_3();

							$.each(ul, 23, () => $.get(filteredItems), (item) => item.id, ($$anchor, item, index) => {
								var li = root_2();
								var div = $.child(li);
								var node_2 = $.child(div);

								{
									var consequent = ($$anchor) => {
										var span = root();
										var text = $.only_child(span, true);

										$.template_effect(() => $.set_text(text, $.get(item).icon));
										$.append($$anchor, span);
									};

									$.if(node_2, ($$render) => {
										if ($.get(item).icon) $$render(consequent);
									});
								}

								var div_1 = $.sibling(node_2, 2);
								var div_2 = $.child(div_1);
								var text_1 = $.only_child(div_2, true);
								var node_3 = $.sibling(div_2, 2);

								{
									var consequent_1 = ($$anchor) => {
										var div_3 = root_1();
										var text_2 = $.only_child(div_3, true);

										$.template_effect(
											($0) => {
												$.set_class(div_3, 1, $0);
												$.set_text(text_2, $.get(item).description);
											},
											[
												() => $.clsx(styles.itemDescription({
													class: clsx($.get(theme)?.itemDescription, $$props.classes?.itemDescription)
												}))
											]
										);

										$.append($$anchor, div_3);
									};

									$.if(node_3, ($$render) => {
										if ($.get(item).description) $$render(consequent_1);
									});
								}

								$.reset(div_1);
								$.reset(div);
								$.reset(li);

								$.template_effect(
									($0) => {
										$.set_attribute(li, 'data-index', $.get(index));
										$.set_attribute(li, 'id', $.get(item).id);
										$.set_attribute(li, 'aria-selected', $.get(index) === $.get(selectedIndex));
										$.set_class(li, 1, $0);
										$.set_text(text_1, $.get(item).label);
									},
									[
										() => $.clsx(styles.item({
											selected: $.get(index) === $.get(selectedIndex),
											class: clsx($.get(theme)?.item, $$props.classes?.item)
										}))
									]
								);

								$.delegated('click', li, () => selectItem($.get(item)));
								$.delegated('keydown', li, (e) => e.key === "Enter" && selectItem($.get(item)));
								$.event('mouseenter', li, () => $.set(selectedIndex, $.get(index), true));
								$.append($$anchor, li);
							});

							$.reset(ul);

							$.template_effect(
								($0) => {
									$.set_attribute(ul, 'id', ulId);
									$.set_class(ul, 1, $0);
								},
								[
									() => $.clsx(styles.list({ class: clsx($.get(theme)?.list, $$props.classes?.list) }))
								]
							);

							$.append($$anchor, ul);
						};

						var consequent_3 = ($$anchor) => {
							var div_4 = root_4();
							var p = $.child(div_4);
							var text_3 = $.only_child(p, true);

							$.reset(div_4);

							$.template_effect(
								($0) => {
									$.set_class(div_4, 1, $0);
									$.set_text(text_3, emptyMessage());
								},
								[
									() => $.clsx(styles.empty({ class: clsx($.get(theme)?.empty, $$props.classes?.empty) }))
								]
							);

							$.append($$anchor, div_4);
						};

						$.if(node_1, ($$render) => {
							if ($.get(filteredItems).length > 0) $$render(consequent_2); else if ($.get(search)) $$render(consequent_3, 1);
						});
					}

					var div_5 = $.sibling(node_1, 2);
					var div_6 = $.child(div_5);
					var kbd = $.child(div_6);
					var node_4 = $.child(kbd);

					{
						var consequent_4 = ($$anchor) => {
							var span_1 = root_5();

							$.append($$anchor, span_1);
						};

						var alternate = ($$anchor) => {
							var span_2 = root_6();

							$.append($$anchor, span_2);
						};

						$.if(node_4, ($$render) => {
							if (vim()) $$render(consequent_4); else $$render(alternate, -1);
						});
					}

					$.next(2);
					$.reset(kbd);

					var kbd_1 = $.sibling(kbd, 2);

					$.reset(div_6);

					var kbd_2 = $.sibling(div_6, 2);

					$.reset(div_5);

					$.template_effect(
						($0, $1, $2, $3) => {
							$.set_class(div_5, 1, $0);
							$.set_class(kbd, 1, $1);
							$.set_class(kbd_1, 1, $2);
							$.set_class(kbd_2, 1, $3);
						},
						[
							() => $.clsx(styles.footer({ class: clsx($.get(theme)?.footer, $$props.classes?.footer) })),
							() => $.clsx(styles.kbd({ class: clsx($.get(theme)?.kbd, $$props.classes?.kbd) })),
							() => $.clsx(styles.kbd({ class: clsx($.get(theme)?.kbd, $$props.classes?.kbd) })),
							() => $.clsx(styles.kbd({ class: clsx($.get(theme)?.kbd, $$props.classes?.kbd) }))
						]
					);

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}

$.delegate(['click', 'keydown']);