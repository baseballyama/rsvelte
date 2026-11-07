import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge, Modal } from "$lib";
import { formatDistanceToNow } from "date-fns";
import { clipboardManager } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";

var root = $.from_html(`<div><div><input type="text" placeholder="Search clipboard..."/> <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg></div> <button> </button></div>`);
var root_1 = $.from_html(`<div><div><input type="text"/> <button> </button></div> <!></div>`);
var root_2 = $.from_html(`<div><div><div><input type="text" placeholder="Search clipboard..."/> <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg></div> <button> </button></div></div>`);
var root_3 = $.from_html(`<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <p>No clipboard items yet.</p> <p><!></p>`, 1);
var root_4 = $.from_html(`<p> </p>`);
var root_5 = $.from_html(`<div><!></div>`);
var root_6 = $.from_html(`<div><div><div><!> <span> </span></div> <p> </p></div> <div><button aria-label="Copy"><svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect width="8" height="8" x="8" y="8" rx="2" ry="2"></rect><path d="M4 12V4a2 2 0 0 1 2-2h8"></path></svg></button> <button><svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 17v5"></path><path d="M8 13h8l1-5h-10z"></path><path d="M10 3h4v5h-4z"></path></svg></button> <button aria-label="Delete"><svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"></path><path d="M10 11v6M14 11v6"></path></svg></button></div></div>`);
var root_7 = $.from_html(`<div><!> <!></div>`);
var root_8 = $.from_html(`<div><div><span> </span> <button>Save to Clipboard</button></div> <div></div></div>`);
var root_9 = $.from_svg(`<path d="M5 13l4 4L19 7"></path>`);
var root_10 = $.from_svg(`<circle cx="12" cy="12" r="10"></circle><path d="M15 9l-6 6M9 9l6 6"></path>`, 1);
var root_11 = $.from_svg(`<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path>`, 1);
var root_12 = $.from_html(`<div><div><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><!></svg> <span> </span></div></div>`);
var root_13 = $.from_html(`<!> <!> <!>`, 1);

export default function ClipboardManager($$anchor, $$props) {
	$.push($$props, true);

	const // If undefined, renders inline; if defined, renders as modal
	// Selection menu state
	// Save to localStorage whenever items change (but skip the initial load)
	// First load: use initial items and save them
	// --- Selection Menu Logic ---
	// Close menu if clicking outside
	// --- Sensitive data detection ---
	// Use user-provided function if available, otherwise fallback
	// --- Helpers ---
	// --- Save from selection menu ---
	// --- Clipboard actions ---
	inputArea = ($$anchor) => {
		var div = root_1();
		var div_1 = $.child(div);
		var input = $.child(div_1);

		$.remove_input_defaults(input);

		var button = $.sibling(input, 2);
		var text_1 = $.only_child(button, true);

		$.reset(div_1);

		var node = $.sibling(div_1, 2);

		{
			var consequent = ($$anchor) => {
				var div_2 = root();
				var div_3 = $.child(div_2);
				var input_1 = $.child(div_3);

				$.remove_input_defaults(input_1);

				var svg = $.sibling(input_1, 2);

				$.reset(div_3);

				var button_1 = $.sibling(div_3, 2);
				var text_2 = $.only_child(button_1, true);

				$.reset(div_2);

				$.template_effect(
					($0, $1, $2, $3, $4) => {
						$.set_class(div_2, 1, $0);
						$.set_class(div_3, 1, $1);
						$.set_class(input_1, 1, $2);
						$.set_class(svg, 0, $3);
						$.set_class(button_1, 1, $4);
						$.set_text(text_2, clearLabel());
					},
					[
						() => $.clsx($.get(styles).searchWrapper({
							class: clsx($.get(theme)?.searchWrapper, $$props.classes?.searchWrapper)
						})),

						() => $.clsx($.get(styles).searchContainer({
							class: clsx($.get(theme)?.searchContainer, $$props.classes?.searchContainer)
						})),

						() => $.clsx($.get(styles).searchInput({
							class: clsx($.get(theme)?.searchInput, $$props.classes?.searchInput)
						})),

						() => $.clsx($.get(styles).searchIcon({
							class: clsx($.get(theme)?.searchIcon, $$props.classes?.searchIcon)
						})),

						() => $.clsx($.get(styles).clearAll({
							class: clsx($.get(theme)?.clearAll, $$props.classes?.clearAll)
						}))
					]
				);

				$.bind_value(input_1, () => $.get(searchQuery), ($$value) => $.set(searchQuery, $$value));
				$.delegated('click', button_1, clearAll);
				$.append($$anchor, div_2);
			};

			$.if(node, ($$render) => {
				if ($.get(items).length > 0) $$render(consequent);
			});
		}

		$.reset(div);

		$.template_effect(
			($0, $1, $2, $3, $4) => {
				$.set_class(div, 1, $0);
				$.set_class(div_1, 1, $1);
				$.set_attribute(input, 'placeholder', placeholder());
				$.set_class(input, 1, $2);
				button.disabled = $3;
				$.set_class(button, 1, $4);
				$.set_text(text_1, saveLabel());
			},
			[
				() => $.clsx($.get(styles).inputSection({
					class: clsx($.get(theme)?.inputSection, $$props.classes?.inputSection)
				})),

				() => $.clsx($.get(styles).inputWrapper({
					class: clsx($.get(theme)?.inputWrapper, $$props.classes?.inputWrapper)
				})),
				() => $.clsx($.get(styles).input({ class: clsx($.get(theme)?.input, $$props.classes?.input) })),
				() => !$.get(newText).trim(),
				() => $.clsx($.get(styles).addToClipboard({
					class: clsx($.get(theme)?.addToClipboard, $$props.classes?.addToClipboard)
				}))
			]
		);

		$.delegated('keydown', input, handleKeydown);
		$.bind_value(input, () => $.get(newText), ($$value) => $.set(newText, $$value));
		$.delegated('click', button, addToClipboard);
		$.append($$anchor, div);
	};

	const searchClear = ($$anchor) => {
		var div_4 = root_2();
		var div_5 = $.child(div_4);
		var div_6 = $.child(div_5);
		var input_2 = $.child(div_6);

		$.remove_input_defaults(input_2);

		var svg_1 = $.sibling(input_2, 2);

		$.reset(div_6);

		var button_2 = $.sibling(div_6, 2);
		var text_3 = $.only_child(button_2, true);

		$.reset(div_5);
		$.reset(div_4);

		$.template_effect(
			($0, $1, $2, $3, $4, $5) => {
				$.set_class(div_4, 1, $0);
				$.set_class(div_5, 1, $1);
				$.set_class(div_6, 1, $2);
				$.set_class(input_2, 1, $3);
				$.set_class(svg_1, 0, $4);
				$.set_class(button_2, 1, $5);
				$.set_text(text_3, clearLabel());
			},
			[
				() => $.clsx($.get(styles).inputSection({
					class: clsx($.get(theme)?.inputSection, $$props.classes?.inputSection)
				})),

				() => $.clsx($.get(styles).searchWrapper({
					class: clsx($.get(theme)?.searchWrapper, $$props.classes?.searchWrapper)
				})),

				() => $.clsx($.get(styles).searchContainer({
					class: clsx($.get(theme)?.searchContainer, $$props.classes?.searchContainer)
				})),

				() => $.clsx($.get(styles).searchInput({
					class: clsx($.get(theme)?.searchInput, $$props.classes?.searchInput)
				})),

				() => $.clsx($.get(styles).searchIcon({
					class: clsx($.get(theme)?.searchIcon, $$props.classes?.searchIcon)
				})),

				() => $.clsx($.get(styles).clearAll({
					class: clsx($.get(theme)?.clearAll, $$props.classes?.clearAll)
				}))
			]
		);

		$.bind_value(input_2, () => $.get(searchQuery), ($$value) => $.set(searchQuery, $$value));
		$.delegated('click', button_2, clearAll);
		$.append($$anchor, div_4);
	};

	const itemList = ($$anchor) => {
		var div_7 = root_5();
		var node_1 = $.child(div_7);

		{
			var consequent_4 = ($$anchor) => {
				var fragment = $.comment();
				var node_2 = $.first_child(fragment);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						$.snippet(node_3, () => $$props.emptyState);
						$.append($$anchor, fragment_1);
					};

					var alternate_2 = ($$anchor) => {
						var div_8 = root_5();
						var node_4 = $.child(div_8);

						{
							var consequent_3 = ($$anchor) => {
								var fragment_2 = root_3();
								var svg_2 = $.first_child(fragment_2);
								var p = $.sibling(svg_2, 2);
								var p_1 = $.sibling(p, 2);
								var node_5 = $.child(p_1);

								{
									var consequent_2 = ($$anchor) => {
										var text_4 = $.text('Select any text and click "Save" to add it here');

										$.append($$anchor, text_4);
									};

									var alternate = ($$anchor) => {
										var text_5 = $.text('Start typing above to save text');

										$.append($$anchor, text_5);
									};

									$.if(node_5, ($$render) => {
										if (enableSelectionMenu()) $$render(consequent_2); else $$render(alternate, -1);
									});
								}

								$.reset(p_1);

								$.template_effect(
									($0, $1, $2) => {
										$.set_class(svg_2, 0, $0);
										$.set_class(p, 1, $1);
										$.set_class(p_1, 1, $2);
									},
									[
										() => $.clsx($.get(styles).emptyIcon({
											class: clsx($.get(theme)?.emptyIcon, $$props.classes?.emptyIcon)
										})),

										() => $.clsx($.get(styles).emptyText({
											class: clsx($.get(theme)?.emptyText, $$props.classes?.emptyText)
										})),

										() => $.clsx($.get(styles).emptySubtext({
											class: clsx($.get(theme)?.emptySubtext, $$props.classes?.emptySubtext)
										}))
									]
								);

								$.append($$anchor, fragment_2);
							};

							var alternate_1 = ($$anchor) => {
								var p_2 = root_4();
								var text_6 = $.only_child(p_2);

								$.template_effect(
									($0) => {
										$.set_class(p_2, 1, $0);
										$.set_text(text_6, `No items match "${$.get(searchQuery) ?? ''}"`);
									},
									[
										() => $.clsx($.get(styles).emptyText({
											class: clsx($.get(theme)?.emptyText, $$props.classes?.emptyText)
										}))
									]
								);

								$.append($$anchor, p_2);
							};

							$.if(node_4, ($$render) => {
								if ($.get(items).length === 0) $$render(consequent_3); else $$render(alternate_1, -1);
							});
						}

						$.reset(div_8);

						$.template_effect(($0) => $.set_class(div_8, 1, $0), [
							() => $.clsx($.get(styles).emptyState({
								class: clsx($.get(theme)?.emptyState, $$props.classes?.emptyState)
							}))
						]);

						$.append($$anchor, div_8);
					};

					$.if(node_2, ($$render) => {
						if ($$props.emptyState) $$render(consequent_1); else $$render(alternate_2, -1);
					});
				}

				$.append($$anchor, fragment);
			};

			var alternate_4 = ($$anchor) => {
				var fragment_3 = $.comment();
				var node_6 = $.first_child(fragment_3);

				$.each(node_6, 17, () => $.get(filteredItems), (item) => item.id, ($$anchor, item) => {
					var fragment_4 = $.comment();
					var node_7 = $.first_child(fragment_4);

					{
						var consequent_5 = ($$anchor) => {
							var fragment_5 = $.comment();
							var node_8 = $.first_child(fragment_5);

							$.snippet(node_8, () => $$props.children, () => ({ item: $.get(item), copyItem, deleteItem, togglePin }));
							$.append($$anchor, fragment_5);
						};

						var alternate_3 = ($$anchor) => {
							var div_9 = root_6();
							var div_10 = $.child(div_9);
							var div_11 = $.child(div_10);
							var node_9 = $.child(div_11);

							{
								var consequent_6 = ($$anchor) => {
									Badge($$anchor, $.spread_props(badgeProps, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Pinned');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									}));
								};

								$.if(node_9, ($$render) => {
									if ($.get(item).pinned) $$render(consequent_6);
								});
							}

							var span = $.sibling(node_9, 2);
							var text_8 = $.only_child(span, true);

							$.reset(div_11);

							var p_3 = $.sibling(div_11, 2);
							var text_9 = $.only_child(p_3, true);

							$.reset(div_10);

							var div_12 = $.sibling(div_10, 2);
							var button_3 = $.child(div_12);
							var svg_3 = $.only_child(button_3);
							var button_4 = $.sibling(button_3, 2);
							var svg_4 = $.only_child(button_4);
							var button_5 = $.sibling(button_4, 2);
							var svg_5 = $.only_child(button_5);

							$.reset(div_12);
							$.reset(div_9);

							$.template_effect(
								($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) => {
									$.set_class(div_9, 1, $0);
									$.set_class(div_10, 1, $1);
									$.set_class(div_11, 1, $2);
									$.set_class(span, 1, $3);
									$.set_text(text_8, $4);
									$.set_class(p_3, 1, $5);
									$.set_text(text_9, $.get(item).text);
									$.set_class(div_12, 1, $6);
									$.set_class(button_3, 1, $7);
									$.set_class(svg_3, 0, $8);
									$.set_class(button_4, 1, $9);
									$.set_attribute(button_4, 'aria-label', $.get(item).pinned ? "Unpin" : "Pin");
									$.set_class(svg_4, 0, $10);
									$.set_class(button_5, 1, $11);
									$.set_class(svg_5, 0, $12);
								},
								[
									() => $.clsx($.get(styles).item({ class: clsx($.get(theme)?.item, $$props.classes?.item) })),
									() => $.clsx($.get(styles).itemContent({
										class: clsx($.get(theme)?.itemContent, $$props.classes?.itemContent)
									})),

									() => $.clsx($.get(styles).itemHeader({
										class: clsx($.get(theme)?.itemHeader, $$props.classes?.itemHeader)
									})),

									() => $.clsx($.get(styles).itemTimestamp({
										class: clsx($.get(theme)?.itemTimestamp, $$props.classes?.itemTimestamp)
									})),
									() => formatDistanceToNow($.get(item).timestamp, { addSuffix: true }),
									() => $.clsx($.get(styles).itemText({
										class: clsx($.get(theme)?.itemText, $$props.classes?.itemText)
									})),

									() => $.clsx($.get(styles).itemActions({
										class: clsx($.get(theme)?.itemActions, $$props.classes?.itemActions)
									})),

									() => $.clsx($.get(styles).actionButton({
										class: clsx($.get(theme)?.actionButton, $$props.classes?.actionButton)
									})),

									() => $.clsx($.get(styles).actionIcon({
										class: clsx($.get(theme)?.actionIcon, $$props.classes?.actionIcon)
									})),

									() => $.clsx($.get(styles).pinButton({
										pinned: $.get(item).pinned,
										class: clsx($.get(theme)?.pinButton, $$props.classes?.pinButton)
									})),

									() => $.clsx($.get(styles).actionIcon({
										class: clsx($.get(theme)?.actionIcon, $$props.classes?.actionIcon)
									})),

									() => $.clsx($.get(styles).deleteButton({
										class: clsx($.get(theme)?.deleteButton, $$props.classes?.deleteButton)
									})),

									() => $.clsx($.get(styles).actionIcon({
										class: clsx($.get(theme)?.actionIcon, $$props.classes?.actionIcon)
									}))
								]
							);

							$.delegated('click', button_3, () => copyItem($.get(item)));
							$.delegated('click', button_4, () => togglePin($.get(item).id));
							$.delegated('click', button_5, () => deleteItem($.get(item).id));
							$.append($$anchor, div_9);
						};

						$.if(node_7, ($$render) => {
							if ($$props.children) $$render(consequent_5); else $$render(alternate_3, -1);
						});
					}

					$.append($$anchor, fragment_4);
				});

				$.append($$anchor, fragment_3);
			};

			$.if(node_1, ($$render) => {
				if ($.get(filteredItems).length === 0) $$render(consequent_4); else $$render(alternate_4, -1);
			});
		}

		$.reset(div_7);

		$.template_effect(($0) => $.set_class(div_7, 1, $0), [
			() => $.clsx($.get(styles).itemsList({
				class: clsx($.get(theme)?.itemsList, $$props.classes?.itemsList)
			}))
		]);

		$.append($$anchor, div_7);
	};

	let initialItems = $.prop($$props, 'items', 19, () => []),
		placeholder = $.prop($$props, 'placeholder', 3, "Type and save to clipboard"),
		saveLabel = $.prop($$props, 'saveLabel', 3, "Save"),
		clearLabel = $.prop($$props, 'clearLabel', 3, "Clear All"),
		limit = $.prop($$props, 'limit', 3, 20),
		saveToStorage = $.prop($$props, 'saveToStorage', 3, true),
		toastDuration = $.prop($$props, 'toastDuration', 3, 2000),
		filterSensitive = $.prop($$props, 'filterSensitive', 3, true),
		maxLength = $.prop($$props, 'maxLength', 3, 10000),
		enableSelectionMenu = $.prop($$props, 'enableSelectionMenu', 3, false),
		selectionTarget = $.prop($$props, 'selectionTarget', 3, "body"),
		showInput = $.prop($$props, 'showInput', 3, true),
		className = $.prop($$props, 'class', 3, ""),
		open = $.prop($$props, 'open', 15),
		badgeProps = $.prop($$props, 'badgeProps', 19, () => ({ color: "blue", class: "text-xs" }));

	const theme = $.derived(() => getTheme("clipboardManager"));
	const isModal = $.derived(() => open() !== undefined);
	const styles = $.derived(clipboardManager);
	let items = $.state($.proxy([]));

	$.user_effect(() => {
		if (initialItems().length > 0) {
			$.set(items, initialItems(), true);
		}
	});

	let newText = $.state("");
	let searchQuery = $.state("");
	let toast = $.state(null);

	// Selection menu state
	let selectionMenu = $.state($.proxy({ show: false, x: 0, y: 0, text: "" }));

	const STORAGE_KEY = $.derived(() => $$props.storageKey ?? "flowbite-clipboard-manager");

	// Save to localStorage whenever items change (but skip the initial load)
	let isFirstLoad = true;

	$.user_effect(() => {
		if (saveToStorage() && typeof window !== "undefined") {
			const saved = localStorage.getItem($.get(STORAGE_KEY));

			if (saved) {
				try {
					const parsed = JSON.parse(saved);

					if (initialItems().length === 0) {
						$.set(items, parsed, true);
					} else if (isFirstLoad) {
						// First load: use initial items and save them
						localStorage.setItem($.get(STORAGE_KEY), JSON.stringify($.get(items)));
					}
				} catch(e) {
					console.error("Failed to parse clipboard data:", e);
				}
			} else if (initialItems().length > 0) {
				localStorage.setItem($.get(STORAGE_KEY), JSON.stringify($.get(items)));
			}

			isFirstLoad = false;
		}
	});

	$.user_effect(() => {
		if (saveToStorage() && typeof window !== "undefined") {
			if (isFirstLoad) {
				isFirstLoad = false;

				return;
			}

			localStorage.setItem($.get(STORAGE_KEY), JSON.stringify($.get(items)));
		}
	});

	// --- Selection Menu Logic ---
	$.user_effect(() => {
		if (!enableSelectionMenu() || typeof window === "undefined") return;

		const targetElements = document.querySelectorAll(selectionTarget());
		const elements = targetElements.length > 0 ? Array.from(targetElements) : [document.body];

		const handleMouseUp = () => {
			setTimeout(
				() => {
					const selection = window.getSelection();
					const selectedText = selection?.toString().trim();

					if (selectedText && selectedText.length > 0) {
						const range = selection.getRangeAt(0);
						const rect = range.getBoundingClientRect();

						$.set(
							selectionMenu,
							{
								show: true,
								x: rect.left + rect.width / 2,
								y: rect.top - 10,
								text: selectedText
							},
							true
						);
					} else {
						$.set(selectionMenu, { show: false, x: 0, y: 0, text: "" }, true);
					}
				},
				10
			);
		};

		const handleMouseDown = (e) => {
			// Close menu if clicking outside
			if ($.get(selectionMenu).show && !e.target.closest(".selection-menu")) {
				$.set(selectionMenu, { show: false, x: 0, y: 0, text: "" }, true);
			}
		};

		elements.forEach((el) => el.addEventListener("mouseup", handleMouseUp));
		document.addEventListener("mousedown", handleMouseDown);

		return () => {
			elements.forEach((el) => el.removeEventListener("mouseup", handleMouseUp));
			document.removeEventListener("mousedown", handleMouseDown);
		};
	});

	// --- Sensitive data detection ---
	const defaultContainsSensitiveData = (text) => {
		if (!filterSensitive()) return false;

		const ccPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/;
		const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{12,}$/;
		const apiKeyPattern = /\b[A-Za-z0-9_-]{32,}\b/;
		const credentialPattern = /(password|passwd|pwd|token|secret|api[_-]?key)[\s:=]/i;

		return ccPattern.test(text) || passwordPattern.test(text) || apiKeyPattern.test(text) || credentialPattern.test(text);
	};

	// Use user-provided function if available, otherwise fallback
	const containsSensitiveData = (text) => {
		if (typeof $$props.detectSensitiveData === "function") {
			return $$props.detectSensitiveData(text);
		}

		return defaultContainsSensitiveData(text);
	};

	// --- Helpers ---
	const showToast = (message, type = "success") => {
		$.set(toast, { message, type }, true);
		setTimeout(() => $.set(toast, null), toastDuration());
	};

	const sortItems = (itemsList) => {
		const pinned = itemsList.filter((i) => i.pinned).sort((a, b) => b.timestamp - a.timestamp);
		const unpinned = itemsList.filter((i) => !i.pinned).sort((a, b) => b.timestamp - a.timestamp);

		return [...pinned, ...unpinned];
	};

	const filteredItems = $.derived(() => $.get(searchQuery).trim()
		? $.get(items).filter((i) => i.text.toLowerCase().includes($.get(searchQuery).toLowerCase()))
		: $.get(items));

	// --- Save from selection menu ---
	const saveSelection = async () => {
		const text = $.get(selectionMenu).text;

		if (!text) return;

		if (text.length > maxLength()) {
			showToast(`Text too long (max ${maxLength()} characters)`, "error");
			$.set(selectionMenu, { show: false, x: 0, y: 0, text: "" }, true);

			return;
		}

		if (containsSensitiveData(text)) {
			showToast("Sensitive data detected. Not saved for security.", "error");
			$.set(selectionMenu, { show: false, x: 0, y: 0, text: "" }, true);

			return;
		}

		const duplicate = $.get(items).find((i) => i.text === text);

		if (duplicate) {
			showToast("Already saved", "info");
			$.set(selectionMenu, { show: false, x: 0, y: 0, text: "" }, true);

			return;
		}

		const item = { id: Date.now(), text, timestamp: Date.now() };

		$.set(items, sortItems([item, ...$.get(items)]).slice(0, limit()), true);
		showToast("Saved to clipboard manager");
		$.set(selectionMenu, { show: false, x: 0, y: 0, text: "" }, true);
	};

	// --- Clipboard actions ---
	const addToClipboard = async () => {
		const trimmed = $.get(newText).trim();

		if (!trimmed) return;

		if (trimmed.length > maxLength()) {
			showToast(`Text too long (max ${maxLength()} characters)`, "error");

			return;
		}

		if (containsSensitiveData(trimmed)) {
			showToast("Sensitive data detected. Not saved for security.", "error");
			$.set(newText, "");

			return;
		}

		const duplicate = $.get(items).find((i) => i.text === trimmed);

		if (duplicate) {
			showToast("This text is already in your clipboard", "info");
			$.set(newText, "");

			return;
		}

		const item = { id: Date.now(), text: trimmed, timestamp: Date.now() };

		$.set(items, sortItems([item, ...$.get(items)]).slice(0, limit()), true);
		$.set(newText, "");

		try {
			await navigator.clipboard.writeText(item.text);
			showToast("Saved and copied to clipboard");
		} catch(e) {
			console.error("Clipboard write failed:", e);
			showToast("Saved but clipboard access denied", "error");
		}
	};

	const copyItem = async (item) => {
		try {
			await navigator.clipboard.writeText(item.text);
			showToast("Copied to clipboard");
		} catch(e) {
			showToast("Clipboard access denied", "error");
		}
	};

	const deleteItem = (id) => {
		$.set(items, $.get(items).filter((i) => i.id !== id), true);
		showToast("Deleted");
	};

	const togglePin = (id) => {
		$.set(items, $.get(items).map((i) => i.id === id ? { ...i, pinned: !i.pinned } : i), true);
		$.set(items, sortItems($.get(items)), true);
	};

	const clearAll = () => {
		if (confirm("Clear all clipboard items?")) {
			$.set(items, [], true);
			showToast("All items cleared");
		}
	};

	const handleKeydown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			addToClipboard();
		}
	};

	var fragment_7 = root_13();
	var node_10 = $.first_child(fragment_7);

	{
		var consequent_9 = ($$anchor) => {
			Modal($$anchor, $.spread_props({ title: 'Clipboard Manager' }, () => $$props.modalProps, {
				get open() {
					return open();
				},

				set open($$value) {
					open($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var div_13 = root_7();
					var node_11 = $.child(div_13);

					{
						var consequent_7 = ($$anchor) => {
							inputArea($$anchor);
						};

						var consequent_8 = ($$anchor) => {
							searchClear($$anchor);
						};

						$.if(node_11, ($$render) => {
							if (showInput()) $$render(consequent_7); else if ($.get(items).length > 0) $$render(consequent_8, 1);
						});
					}

					var node_12 = $.sibling(node_11, 2);

					itemList(node_12);
					$.reset(div_13);

					$.template_effect(($0) => $.set_class(div_13, 1, $0), [
						() => $.clsx($.get(styles).base({ class: clsx($.get(theme)?.base, className()) }))
					]);

					$.append($$anchor, div_13);
				},
				$$slots: { default: true }
			}));
		};

		var alternate_5 = ($$anchor) => {
			var div_14 = root_7();
			var node_13 = $.child(div_14);

			{
				var consequent_10 = ($$anchor) => {
					inputArea($$anchor);
				};

				var consequent_11 = ($$anchor) => {
					searchClear($$anchor);
				};

				$.if(node_13, ($$render) => {
					if (showInput()) $$render(consequent_10); else if ($.get(items).length > 0) $$render(consequent_11, 1);
				});
			}

			var node_14 = $.sibling(node_13, 2);

			itemList(node_14);
			$.reset(div_14);

			$.template_effect(($0) => $.set_class(div_14, 1, $0), [
				() => $.clsx($.get(styles).base({ class: clsx($.get(theme)?.base, className()) }))
			]);

			$.append($$anchor, div_14);
		};

		$.if(node_10, ($$render) => {
			if ($.get(isModal)) $$render(consequent_9); else $$render(alternate_5, -1);
		});
	}

	var node_15 = $.sibling(node_10, 2);

	{
		var consequent_12 = ($$anchor) => {
			var div_15 = root_8();
			var div_16 = $.child(div_15);
			var span_1 = $.child(div_16);
			var text_10 = $.only_child(span_1);
			var button_6 = $.sibling(span_1, 2);

			$.reset(div_16);

			var div_17 = $.sibling(div_16, 2);

			$.reset(div_15);

			$.template_effect(
				($0, $1, $2, $3, $4, $5) => {
					$.set_class(div_15, 1, $0);
					$.set_style(div_15, `left: ${$.get(selectionMenu).x ?? ''}px; top: ${$.get(selectionMenu).y ?? ''}px;`);
					$.set_class(div_16, 1, $1);
					$.set_class(span_1, 1, $2);
					$.set_text(text_10, `${$3 ?? ''}${$.get(selectionMenu).text.length > 50 ? "..." : ""}`);
					$.set_class(button_6, 1, $4);
					$.set_class(div_17, 1, $5);
				},
				[
					() => $.clsx($.get(styles).selectionMenu({
						class: clsx($.get(theme)?.selectionMenu, $$props.classes?.selectionMenu)
					})),

					() => $.clsx($.get(styles).selectionBubble({
						class: clsx($.get(theme)?.selectionBubble, $$props.classes?.selectionBubble)
					})),

					() => $.clsx($.get(styles).selectionText({
						class: clsx($.get(theme)?.selectionText, $$props.classes?.selectionText)
					})),
					() => $.get(selectionMenu).text.slice(0, 50),
					() => $.clsx($.get(styles).selectionButton()),
					() => $.clsx($.get(styles).selectionArrow({
						class: clsx($.get(theme)?.selectionArrow, $$props.classes?.selectionArrow)
					}))
				]
			);

			$.delegated('click', button_6, saveSelection);
			$.append($$anchor, div_15);
		};

		$.if(node_15, ($$render) => {
			if ($.get(selectionMenu).show) $$render(consequent_12);
		});
	}

	var node_16 = $.sibling(node_15, 2);

	{
		var consequent_15 = ($$anchor) => {
			var div_18 = root_12();
			var div_19 = $.child(div_18);
			var svg_6 = $.child(div_19);
			var node_17 = $.child(svg_6);

			{
				var consequent_13 = ($$anchor) => {
					var path = root_9();

					$.append($$anchor, path);
				};

				var consequent_14 = ($$anchor) => {
					var fragment_13 = root_10();

					$.next();
					$.append($$anchor, fragment_13);
				};

				var alternate_6 = ($$anchor) => {
					var fragment_14 = root_11();

					$.next();
					$.append($$anchor, fragment_14);
				};

				$.if(node_17, ($$render) => {
					if ($.get(toast).type === "success") $$render(consequent_13); else if ($.get(toast).type === "error") $$render(consequent_14, 1); else $$render(alternate_6, -1);
				});
			}

			$.reset(svg_6);

			var span_2 = $.sibling(svg_6, 2);
			var text_11 = $.only_child(span_2, true);

			$.reset(div_19);
			$.reset(div_18);

			$.template_effect(
				($0, $1, $2, $3) => {
					$.set_class(div_18, 1, $0);
					$.set_class(div_19, 1, $1);
					$.set_class(svg_6, 0, $2);
					$.set_class(span_2, 1, $3);
					$.set_text(text_11, $.get(toast).message);
				},
				[
					() => $.clsx($.get(styles).toastContainer({
						class: clsx($.get(theme)?.toastContainer, $$props.classes?.toastContainer)
					})),

					() => $.clsx($.get(styles).toast({
						type: $.get(toast).type,
						class: clsx($.get(theme)?.toast, $$props.classes?.toast)
					})),

					() => $.clsx($.get(styles).toastIcon({
						class: clsx($.get(theme)?.toastIcon, $$props.classes?.toastIcon)
					})),

					() => $.clsx($.get(styles).toastText({
						class: clsx($.get(theme)?.toastText, $$props.classes?.toastText)
					}))
				]
			);

			$.append($$anchor, div_18);
		};

		$.if(node_16, ($$render) => {
			if ($.get(toast)) $$render(consequent_15);
		});
	}

	$.append($$anchor, fragment_7);
	$.pop();
}

$.delegate(['keydown', 'click']);