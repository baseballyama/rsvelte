import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { trapFocus } from "$lib/utils/actions";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { createDismissableContext } from "$lib/utils/dismissable";
import clsx from "clsx";
import { sineIn } from "svelte/easing";
import { fade } from "svelte/transition";
import { dialog } from "./theme";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'onaction',
	'oncancel',
	'onsubmit',
	'ontoggle',
	'form',
	'modal',
	'autoclose',
	'focustrap',
	'open',
	'permanent',
	'dismissable',
	'outsideclose',
	'class',
	'classes',
	'transition',
	'transitionParams'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<form method="dialog"><!></form>`);
var root_2 = $.from_html(`<dialog><!></dialog>`);

export default function Dialog($$anchor, $$props) {
	$.push($$props, true);

	const // Prefer requestClose when available to trigger a cancellable "cancel" event; otherwise synthesize it.
	// ignore if not on dialog
	// this event gets called when user canceled the dialog:
	// pressesed ESC key, clicked outside, pressed submit button with no 'value' like close button
	// prevent anyway, we need clean close
	// click outside - backdrop is dialog
	// When dialog contains the <form method="dialog"> and when child with type="submit" was pressed
	// stop dialog.close()
	// this is done by the system but after the submit event
	// if no action - treat that as cancel
	// explicit false from onaction blocks the form closing
	// for cases when toggle by other means
	// Custom focus management
	// fallback
	// dialog/form mechanism will close the dialog
	content = ($$anchor) => {
		var fragment = root();
		var node_1 = $.first_child(fragment);

		$.snippet(node_1, () => $$props.children ?? $.noop);

		var node_2 = $.sibling(node_1, 2);

		{
			var consequent = ($$anchor) => {
				{
					let $0 = $.derived(() => closeCls({ class: clsx($$props.classes?.close) }));

					CloseButton($$anchor, {
						type: 'submit',
						formnovalidate: true,
						get class() {
							return $.get($0);
						}
					});
				}
			};

			$.if(node_2, ($$render) => {
				if (dismissable() && !permanent()) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	};

	let onaction = $.prop($$props, 'onaction', 3, () => true),
		form = $.prop($$props, 'form', 3, false),
		modal = $.prop($$props, 'modal', 3, true),
		autoclose = $.prop($$props, 'autoclose', 3, false),
		focustrap = $.prop($$props, 'focustrap', 3, false),
		open = $.prop($$props, 'open', 15, false),
		permanent = $.prop($$props, 'permanent', 3, false),
		dismissable = $.prop($$props, 'dismissable', 3, true),
		outsideclose = $.prop($$props, 'outsideclose', 3, true),
		transition = $.prop($$props, 'transition', 3, fade),
		restProps = $.rest_props($$props, rest_excludes);

	const paramsOptions = $.derived(() => $$props.transitionParams ?? { duration: 100, easing: sineIn });
	let { base, form: formCls, close: closeCls } = dialog();
	const close = () => open(false);

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
		$$props.oncancel?.(ev);

		if (ev.defaultPrevented) return;

		ev.preventDefault(); // prevent anyway, we need clean close

		if (!permanent()) close();
	}

	function _onclick(ev) {
		const dlg = ev.currentTarget;

		if (ev.target === dlg) {
			// click outside - backdrop is dialog
			const rect = dlg.getBoundingClientRect(),
				clickedInContent = ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom;

			if (outsideclose() && !clickedInContent) {
				return cancel(dlg);
			}
		}

		if (autoclose() && ev.target instanceof HTMLButtonElement && !permanent()) {
			return close();
		}
	}

	function _onsubmit(ev) {
		$$props.onsubmit?.(ev);

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

		if (typeof onaction() === "function") {
			const result = onaction()({ action: dlg.returnValue, data: new FormData(ev.target) });

			// explicit false from onaction blocks the form closing
			if (result === false) return;
		}

		close();
	}

	function _ontoggle(ev) {
		$$props.ontoggle?.(ev);
		open(ev.newState === "open" // for cases when toggle by other means
		);
	}

	function init(dlg) {
		if (modal()) dlg.showModal(); else dlg.show();

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

	const focusTrap = (node) => focustrap() ? trapFocus(node) : undefined;
	let ref = $.state(undefined);

	function close_handler() {
		if (form()) {
			// dialog/form mechanism will close the dialog
			return;
		}

		$.get(ref)?.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true }));
	}

	createDismissableContext(close_handler);

	var fragment_2 = $.comment();
	var node_3 = $.first_child(fragment_2);

	{
		var consequent_2 = ($$anchor) => {
			var dialog_1 = root_2();

			$.attribute_effect(
				dialog_1,
				($0) => ({
					tabindex: '-1',
					onsubmit: _onsubmit,
					oncancel: _oncancel,
					onclick: _onclick,
					ontoggle: _ontoggle,
					...restProps,
					class: $0
				}),
				[() => base({ class: clsx($$props.class) })]
			);

			var node_4 = $.child(dialog_1);

			{
				var consequent_1 = ($$anchor) => {
					var form_1 = root_1();
					var node_5 = $.child(form_1);

					content(node_5);
					$.reset(form_1);

					$.template_effect(($0) => $.set_class(form_1, 1, $0), [
						() => $.clsx(formCls({ class: clsx($$props.classes?.form) }))
					]);

					$.append($$anchor, form_1);
				};

				var alternate = ($$anchor) => {
					content($$anchor);
				};

				$.if(node_4, ($$render) => {
					if (form()) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(dialog_1);
			$.attach(dialog_1, () => init);
			$.bind_this(dialog_1, ($$value) => $.set(ref, $$value), () => $.get(ref));
			$.action(dialog_1, ($$node) => focusTrap?.($$node));
			$.transition(7, dialog_1, transition, () => $.get(paramsOptions));
			$.append($$anchor, dialog_1);
		};

		$.if(node_3, ($$render) => {
			if (open()) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment_2);
	$.pop();
}