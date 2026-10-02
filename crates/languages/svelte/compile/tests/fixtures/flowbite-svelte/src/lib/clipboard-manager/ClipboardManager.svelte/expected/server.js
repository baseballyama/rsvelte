import * as $ from 'svelte/internal/server';
import { Badge, Modal } from "$lib";
import { formatDistanceToNow } from "date-fns";
import { clipboardManager } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";

export default function ClipboardManager($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items: initialItems = [],
			placeholder = "Type and save to clipboard",
			saveLabel = "Save",
			clearLabel = "Clear All",
			limit = 20,
			saveToStorage = true,
			toastDuration = 2000,
			filterSensitive = true,
			maxLength = 10000,
			enableSelectionMenu = false,
			selectionTarget = "body",
			showInput = true,
			class: className = "",
			classes,
			storageKey,
			children,
			emptyState,
			open = void 0, // If undefined, renders inline; if defined, renders as modal
			badgeProps = { color: "blue", class: "text-xs" },
			modalProps,
			detectSensitiveData
		} = $$props;

		const theme = $.derived(() => getTheme("clipboardManager"));
		const isModal = $.derived(() => open !== undefined);
		const styles = $.derived(clipboardManager);
		let items = [];
		let newText = "";
		let searchQuery = "";
		let toast = null;

		// Selection menu state
		let selectionMenu = { show: false, x: 0, y: 0, text: "" };

		const STORAGE_KEY = $.derived(() => storageKey ?? "flowbite-clipboard-manager");

		// Save to localStorage whenever items change (but skip the initial load)
		let isFirstLoad = true;

		// First load: use initial items and save them
		// --- Selection Menu Logic ---
		// Close menu if clicking outside
		// --- Sensitive data detection ---
		const defaultContainsSensitiveData = (text) => {
			if (!filterSensitive) return false;

			const ccPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/;
			const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{12,}$/;
			const apiKeyPattern = /\b[A-Za-z0-9_-]{32,}\b/;
			const credentialPattern = /(password|passwd|pwd|token|secret|api[_-]?key)[\s:=]/i;

			return ccPattern.test(text) || passwordPattern.test(text) || apiKeyPattern.test(text) || credentialPattern.test(text);
		};

		// Use user-provided function if available, otherwise fallback
		const containsSensitiveData = (text) => {
			if (typeof detectSensitiveData === "function") {
				return detectSensitiveData(text);
			}

			return defaultContainsSensitiveData(text);
		};

		// --- Helpers ---
		const showToast = (message, type = "success") => {
			toast = { message, type };
			setTimeout(() => toast = null, toastDuration);
		};

		const sortItems = (itemsList) => {
			const pinned = itemsList.filter((i) => i.pinned).sort((a, b) => b.timestamp - a.timestamp);
			const unpinned = itemsList.filter((i) => !i.pinned).sort((a, b) => b.timestamp - a.timestamp);

			return [...pinned, ...unpinned];
		};

		const filteredItems = $.derived(() => searchQuery.trim()
			? items.filter((i) => i.text.toLowerCase().includes(searchQuery.toLowerCase()))
			: items);

		// --- Save from selection menu ---
		const saveSelection = async () => {
			const text = selectionMenu.text;

			if (!text) return;

			if (text.length > maxLength) {
				showToast(`Text too long (max ${maxLength} characters)`, "error");
				selectionMenu = { show: false, x: 0, y: 0, text: "" };

				return;
			}

			if (containsSensitiveData(text)) {
				showToast("Sensitive data detected. Not saved for security.", "error");
				selectionMenu = { show: false, x: 0, y: 0, text: "" };

				return;
			}

			const duplicate = items.find((i) => i.text === text);

			if (duplicate) {
				showToast("Already saved", "info");
				selectionMenu = { show: false, x: 0, y: 0, text: "" };

				return;
			}

			const item = { id: Date.now(), text, timestamp: Date.now() };

			items = sortItems([item, ...items]).slice(0, limit);
			showToast("Saved to clipboard manager");
			selectionMenu = { show: false, x: 0, y: 0, text: "" };
		};

		// --- Clipboard actions ---
		const addToClipboard = async () => {
			const trimmed = newText.trim();

			if (!trimmed) return;

			if (trimmed.length > maxLength) {
				showToast(`Text too long (max ${maxLength} characters)`, "error");

				return;
			}

			if (containsSensitiveData(trimmed)) {
				showToast("Sensitive data detected. Not saved for security.", "error");
				newText = "";

				return;
			}

			const duplicate = items.find((i) => i.text === trimmed);

			if (duplicate) {
				showToast("This text is already in your clipboard", "info");
				newText = "";

				return;
			}

			const item = { id: Date.now(), text: trimmed, timestamp: Date.now() };

			items = sortItems([item, ...items]).slice(0, limit);
			newText = "";

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
			items = items.filter((i) => i.id !== id);
			showToast("Deleted");
		};

		const togglePin = (id) => {
			items = items.map((i) => i.id === id ? { ...i, pinned: !i.pinned } : i);
			items = sortItems(items);
		};

		const clearAll = () => {
			if (confirm("Clear all clipboard items?")) {
				items = [];
				showToast("All items cleared");
			}
		};

		const handleKeydown = (e) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				addToClipboard();
			}
		};

		function inputArea($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(styles().inputSection({ class: clsx(theme()?.inputSection, classes?.inputSection) })))}><div${$.attr_class($.clsx(styles().inputWrapper({ class: clsx(theme()?.inputWrapper, classes?.inputWrapper) })))}><input type="text"${$.attr('value', newText)}${$.attr('placeholder', placeholder)}${$.attr_class($.clsx(styles().input({ class: clsx(theme()?.input, classes?.input) })))}/> <button${$.attr('disabled', !newText.trim(), true)}${$.attr_class($.clsx(styles().addToClipboard({
				class: clsx(theme()?.addToClipboard, classes?.addToClipboard)
			})))}>${$.escape(saveLabel)}</button></div> `);

			if (items.length > 0) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(styles().searchWrapper({ class: clsx(theme()?.searchWrapper, classes?.searchWrapper) })))}><div${$.attr_class($.clsx(styles().searchContainer({
					class: clsx(theme()?.searchContainer, classes?.searchContainer)
				})))}><input type="text"${$.attr('value', searchQuery)} placeholder="Search clipboard..."${$.attr_class($.clsx(styles().searchInput({ class: clsx(theme()?.searchInput, classes?.searchInput) })))}/> <svg${$.attr_class($.clsx(styles().searchIcon({ class: clsx(theme()?.searchIcon, classes?.searchIcon) })))} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg></div> <button${$.attr_class($.clsx(styles().clearAll({ class: clsx(theme()?.clearAll, classes?.clearAll) })))}>${$.escape(clearLabel)}</button></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		function searchClear($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(styles().inputSection({ class: clsx(theme()?.inputSection, classes?.inputSection) })))}><div${$.attr_class($.clsx(styles().searchWrapper({ class: clsx(theme()?.searchWrapper, classes?.searchWrapper) })))}><div${$.attr_class($.clsx(styles().searchContainer({
				class: clsx(theme()?.searchContainer, classes?.searchContainer)
			})))}><input type="text"${$.attr('value', searchQuery)} placeholder="Search clipboard..."${$.attr_class($.clsx(styles().searchInput({ class: clsx(theme()?.searchInput, classes?.searchInput) })))}/> <svg${$.attr_class($.clsx(styles().searchIcon({ class: clsx(theme()?.searchIcon, classes?.searchIcon) })))} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg></div> <button${$.attr_class($.clsx(styles().clearAll({ class: clsx(theme()?.clearAll, classes?.clearAll) })))}>${$.escape(clearLabel)}</button></div></div>`);
		}

		function itemList($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(styles().itemsList({ class: clsx(theme()?.itemsList, classes?.itemsList) })))}>`);

			if (filteredItems().length === 0) {
				$$renderer.push('<!--[0-->');

				if (emptyState) {
					$$renderer.push('<!--[0-->');
					emptyState($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(styles().emptyState({ class: clsx(theme()?.emptyState, classes?.emptyState) })))}>`);

					if (items.length === 0) {
						$$renderer.push(`<!--[0--><svg${$.attr_class($.clsx(styles().emptyIcon({ class: clsx(theme()?.emptyIcon, classes?.emptyIcon) })))} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <p${$.attr_class($.clsx(styles().emptyText({ class: clsx(theme()?.emptyText, classes?.emptyText) })))}>No clipboard items yet.</p> <p${$.attr_class($.clsx(styles().emptySubtext({ class: clsx(theme()?.emptySubtext, classes?.emptySubtext) })))}>`);

						if (enableSelectionMenu) {
							$$renderer.push(`<!--[0-->Select any text and click "Save" to add it here`);
						} else {
							$$renderer.push(`<!--[-1-->Start typing above to save text`);
						}

						$$renderer.push(`<!--]--></p>`);
					} else {
						$$renderer.push(`<!--[-1--><p${$.attr_class($.clsx(styles().emptyText({ class: clsx(theme()?.emptyText, classes?.emptyText) })))}>No items match "${$.escape(searchQuery)}"</p>`);
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push(`<!--[-1--><!--[-->`);

				const each_array = $.ensure_array_like(filteredItems());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					if (children) {
						$$renderer.push('<!--[0-->');
						children($$renderer, { item, copyItem, deleteItem, togglePin });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(styles().item({ class: clsx(theme()?.item, classes?.item) })))}><div${$.attr_class($.clsx(styles().itemContent({ class: clsx(theme()?.itemContent, classes?.itemContent) })))}><div${$.attr_class($.clsx(styles().itemHeader({ class: clsx(theme()?.itemHeader, classes?.itemHeader) })))}>`);

						if (item.pinned) {
							$$renderer.push('<!--[0-->');

							Badge($$renderer, $.spread_props([
								badgeProps,
								{
									children: ($$renderer) => {
										$$renderer.push(`<!---->Pinned`);
									},
									$$slots: { default: true }
								}
							]));
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <span${$.attr_class($.clsx(styles().itemTimestamp({ class: clsx(theme()?.itemTimestamp, classes?.itemTimestamp) })))}>${$.escape(formatDistanceToNow(item.timestamp, { addSuffix: true }))}</span></div> <p${$.attr_class($.clsx(styles().itemText({ class: clsx(theme()?.itemText, classes?.itemText) })))}>${$.escape(item.text)}</p></div> <div${$.attr_class($.clsx(styles().itemActions({ class: clsx(theme()?.itemActions, classes?.itemActions) })))}><button${$.attr_class($.clsx(styles().actionButton({ class: clsx(theme()?.actionButton, classes?.actionButton) })))} aria-label="Copy"><svg${$.attr_class($.clsx(styles().actionIcon({ class: clsx(theme()?.actionIcon, classes?.actionIcon) })))} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect width="8" height="8" x="8" y="8" rx="2" ry="2"></rect><path d="M4 12V4a2 2 0 0 1 2-2h8"></path></svg></button> <button${$.attr_class($.clsx(styles().pinButton({
							pinned: item.pinned,
							class: clsx(theme()?.pinButton, classes?.pinButton)
						})))}${$.attr('aria-label', item.pinned ? "Unpin" : "Pin")}><svg${$.attr_class($.clsx(styles().actionIcon({ class: clsx(theme()?.actionIcon, classes?.actionIcon) })))} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 17v5"></path><path d="M8 13h8l1-5h-10z"></path><path d="M10 3h4v5h-4z"></path></svg></button> <button${$.attr_class($.clsx(styles().deleteButton({ class: clsx(theme()?.deleteButton, classes?.deleteButton) })))} aria-label="Delete"><svg${$.attr_class($.clsx(styles().actionIcon({ class: clsx(theme()?.actionIcon, classes?.actionIcon) })))} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"></path><path d="M10 11v6M14 11v6"></path></svg></button></div></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (isModal()) {
				$$renderer.push('<!--[0-->');

				Modal($$renderer, $.spread_props([
					{ title: 'Clipboard Manager' },
					modalProps,
					{
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<div${$.attr_class($.clsx(styles().base({ class: clsx(theme()?.base, className) })))}>`);

							if (showInput) {
								$$renderer.push('<!--[0-->');
								inputArea($$renderer);
							} else if (items.length > 0) {
								$$renderer.push('<!--[1-->');
								searchClear($$renderer);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);
							itemList($$renderer);
							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					}
				]));
			} else {
				$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(styles().base({ class: clsx(theme()?.base, className) })))}>`);

				if (showInput) {
					$$renderer.push('<!--[0-->');
					inputArea($$renderer);
				} else if (items.length > 0) {
					$$renderer.push('<!--[1-->');
					searchClear($$renderer);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);
				itemList($$renderer);
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--> `);

			if (selectionMenu.show) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(styles().selectionMenu({ class: clsx(theme()?.selectionMenu, classes?.selectionMenu) })))}${$.attr_style(`left: ${$.stringify(selectionMenu.x)}px; top: ${$.stringify(selectionMenu.y)}px;`)}><div${$.attr_class($.clsx(styles().selectionBubble({
					class: clsx(theme()?.selectionBubble, classes?.selectionBubble)
				})))}><span${$.attr_class($.clsx(styles().selectionText({ class: clsx(theme()?.selectionText, classes?.selectionText) })))}>${$.escape(selectionMenu.text.slice(0, 50))}${$.escape(selectionMenu.text.length > 50 ? "..." : "")}</span> <button${$.attr_class($.clsx(styles().selectionButton()))}>Save to Clipboard</button></div> <div${$.attr_class($.clsx(styles().selectionArrow({
					class: clsx(theme()?.selectionArrow, classes?.selectionArrow)
				})))}></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (toast) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(styles().toastContainer({
					class: clsx(theme()?.toastContainer, classes?.toastContainer)
				})))}><div${$.attr_class($.clsx(styles().toast({
					type: toast.type,
					class: clsx(theme()?.toast, classes?.toast)
				})))}><svg${$.attr_class($.clsx(styles().toastIcon({ class: clsx(theme()?.toastIcon, classes?.toastIcon) })))} fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">`);

				if (toast.type === "success") {
					$$renderer.push(`<!--[0--><path d="M5 13l4 4L19 7"></path>`);
				} else if (toast.type === "error") {
					$$renderer.push(`<!--[1--><circle cx="12" cy="12" r="10"></circle><path d="M15 9l-6 6M9 9l6 6"></path>`);
				} else {
					$$renderer.push(`<!--[-1--><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path>`);
				}

				$$renderer.push(`<!--]--></svg> <span${$.attr_class($.clsx(styles().toastText({ class: clsx(theme()?.toastText, classes?.toastText) })))}>${$.escape(toast.message)}</span></div></div>`);
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
		$.bind_props($$props, { open });
	});
}