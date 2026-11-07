import * as $ from 'svelte/internal/server';
import { trapFocus } from "$lib/utils/actions";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { createDismissableContext } from "$lib/utils/dismissable";
import clsx from "clsx";
import { sineIn } from "svelte/easing";
import { fade } from "svelte/transition";
import { dialog } from "./theme";

export default function Dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			onaction = () => true,
			oncancel,
			onsubmit,
			ontoggle,
			form = false,
			modal = true,
			autoclose = false,
			focustrap = false,
			open = false,
			permanent = false,
			dismissable = true,
			outsideclose = true,
			class: className,
			classes,
			transition = fade,
			transitionParams,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const paramsOptions = $.derived(() => transitionParams ?? { duration: 100, easing: sineIn });
		let { base, form: formCls, close: closeCls } = dialog();
		const close = () => open = false;

		// Prefer requestClose when available to trigger a cancellable "cancel" event; otherwise synthesize it.
		const cancel = (dlg) => {
			if (typeof dlg.requestClose === "function") return dlg.requestClose();

			dlg.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true }));
		};

		function _oncancel(ev) {
			if (ev.target !== ev.currentTarget) {
				return; // ignore if not on dialog
			}

			// this event gets called when user canceled the dialog:
			// pressesed ESC key, clicked outside, pressed submit button with no 'value' like close button
			oncancel?.(ev);

			if (ev.defaultPrevented) return;

			ev.preventDefault(); // prevent anyway, we need clean close

			if (!permanent) close();
		}

		function _onclick(ev) {
			const dlg = ev.currentTarget;

			if (ev.target === dlg) {
				// click outside - backdrop is dialog
				const rect = dlg.getBoundingClientRect(),
					clickedInContent = ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom;

				if (outsideclose && !clickedInContent) {
					return cancel(dlg);
				}
			}

			if (autoclose && ev.target instanceof HTMLButtonElement && !permanent) {
				return close();
			}
		}

		function _onsubmit(ev) {
			onsubmit?.(ev);

			if (ev.defaultPrevented) return;

			// When dialog contains the <form method="dialog"> and when child with type="submit" was pressed
			if (!(ev.target instanceof HTMLFormElement) || ev.target.method !== "dialog") {
				return;
			}

			ev.preventDefault(); // stop dialog.close()

			const dlg = ev.currentTarget;

			if (ev.submitter && "value" in ev.submitter) {
				// this is done by the system but after the submit event
				dlg.returnValue = String(ev.submitter.value ?? "");
			}

			if (!dlg.returnValue) {
				return cancel(dlg); // if no action - treat that as cancel
			}

			if (typeof onaction === "function") {
				const result = onaction({ action: dlg.returnValue, data: new FormData(ev.target) });

				// explicit false from onaction blocks the form closing
				if (result === false) return;
			}

			close();
		}

		function _ontoggle(ev) {
			ontoggle?.(ev);
			open = ev.newState === "open"; // for cases when toggle by other means
		}

		function init(dlg) {
			if (modal) dlg.showModal(); else dlg.show();

			// Custom focus management
			queueMicrotask(() => {
				const autofocusEl = dlg.querySelector("[data-autofocus]") ?? dlg.querySelector('input, textarea, select, button:not([aria-label="Close"])');

				if (autofocusEl) {
					autofocusEl.focus();
				} else {
					dlg.focus(); // fallback
				}
			});

			return () => dlg.close();
		}

		const focusTrap = (node) => focustrap ? trapFocus(node) : undefined;
		let ref = undefined;

		function close_handler() {
			if (form) {
				// dialog/form mechanism will close the dialog
				return;
			}

			ref?.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true }));
		}

		createDismissableContext(close_handler);

		function content($$renderer) {
			children?.($$renderer);
			$$renderer.push(`<!----> `);

			if (dismissable && !permanent) {
				$$renderer.push('<!--[0-->');

				CloseButton($$renderer, {
					type: 'submit',
					formnovalidate: true,
					class: closeCls({ class: clsx(classes?.close) })
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		if (open) {
			$$renderer.push(`<!--[0--><dialog${$.attributes({
				tabindex: '-1',
				...restProps,
				class: $.clsx(base({ class: clsx(className) }))
			})}>`);

			if (form) {
				$$renderer.push(`<!--[0--><form method="dialog"${$.attr_class($.clsx(formCls({ class: clsx(classes?.form) })))}>`);
				content($$renderer);
				$$renderer.push(`<!----></form>`);
			} else {
				$$renderer.push('<!--[-1-->');
				content($$renderer);
			}

			$$renderer.push(`<!--]--></dialog>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { open });
	});
}