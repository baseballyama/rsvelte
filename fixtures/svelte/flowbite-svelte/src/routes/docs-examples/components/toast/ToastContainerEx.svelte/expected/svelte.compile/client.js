import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast, ToastContainer, P, Button, Heading } from "flowbite-svelte";
import { fly } from "svelte/transition";
import { onDestroy } from "svelte";

var root = $.from_html(`<!> <div class="relative min-h-screen p-8"><div class="mx-auto max-w-2xl"><div class="rounded-xl p-8 shadow-lg"><div class="mb-6 flex items-center gap-3"><svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg> <!></div> <!> <div class="space-y-4"><div class="grid grid-cols-2 gap-3"><!> <!> <!> <!></div> <!></div></div></div></div>`, 1);

export default function ToastContainerEx($$anchor, $$props) {
	$.push($$props, true);

	let toasts = $.state($.proxy([]));
	let nextId = $.state(1);

	const messages = {
		green: "Successfully saved!",
		blue: "New message received",
		yellow: "Please review your changes",
		red: "Operation failed"
	};

	function addToast(color) {
		const selectedColor = color || ["green", "blue", "yellow", "red"][Math.floor(Math.random() * 4)];

		const newToast = {
			id: $.get(nextId),
			message: messages[selectedColor],
			color: selectedColor,
			visible: true
		};

		// Auto-dismiss after 5 seconds
		const timeoutId = setTimeout(
			() => {
				dismissToast(newToast.id);
			},
			5000
		);

		newToast.timeoutId = timeoutId;
		$.set(toasts, [...$.get(toasts), newToast], true);
		$.update(nextId);
	}

	function dismissToast(id) {
		// Clear timeout if it exists
		const toast = $.get(toasts).find((t) => t.id === id);

		if (toast?.timeoutId) {
			clearTimeout(toast.timeoutId);
		}

		// Set visible to false to trigger outro transition
		$.set(toasts, $.get(toasts).map((t) => t.id === id ? { ...t, visible: false } : t), true);

		setTimeout(
			() => {
				$.set(toasts, $.get(toasts).filter((t) => t.id !== id), true);
			},
			300
		); // Slightly longer than transition duration
	}

	function handleClose(id) {
		return () => {
			dismissToast(id);
		};
	}

	onDestroy(() => {
		// Clear all pending timeouts on unmount
		$.get(toasts).forEach((toast) => {
			if (toast.timeoutId) {
				clearTimeout(toast.timeoutId);
			}
		});
	});

	var fragment = root();
	var node = $.first_child(fragment);

	ToastContainer(node, {
		position: 'top-right',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => $.get(toasts), (toast) => toast.id, ($$anchor, toast, $$index) => {
				{
					let $0 = $.derived(() => handleClose($.get(toast).id));

					Toast($$anchor, {
						get color() {
							return $.get(toast).color;
						},
						dismissable: true,
						get transition() {
							return fly;
						},
						params: { x: 200, duration: 800 },
						class: 'w-64',
						get onclose() {
							return $.get($0);
						},

						get toastStatus() {
							return $.get(toast).visible;
						},

						set toastStatus($$value) {
							($.get(toast).visible = $$value);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(toast).message));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node_2 = $.sibling($.child(div_3), 2);

	Heading(node_2, {
		tag: 'h1',
		class: 'text-3xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Toast Notifications Demo');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var node_3 = $.sibling(div_3, 2);

	P(node_3, {
		class: 'mb-8',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Click the buttons below to trigger toast notifications. Each toast will appear in the top-right corner and automatically dismiss after 5 seconds.');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var div_4 = $.sibling(node_3, 2);
	var div_5 = $.child(div_4);
	var node_4 = $.child(div_5);

	Button(node_4, {
		onclick: () => addToast("green"),
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Success Toast');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		onclick: () => addToast("blue"),
		color: 'blue',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Info Toast');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Button(node_6, {
		onclick: () => addToast("yellow"),
		color: 'yellow',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Warning Toast');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Button(node_7, {
		onclick: () => addToast("red"),
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Error Toast');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var node_8 = $.sibling(div_5, 2);

	Button(node_8, {
		onclick: () => addToast(),
		color: 'dark',
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Random Toast');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}