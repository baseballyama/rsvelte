import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast, P, Button, Heading } from "flowbite-svelte";
import { fly } from "svelte/transition";

var root = $.from_html(`<div class="relative min-h-screen p-8"><div class="z-50 space-y-3" style="position: absolute; top: 1rem; right: 1rem;"></div> <div class="mx-auto max-w-2xl"><div class="rounded-xl p-8 shadow-lg"><div class="mb-6 flex items-center gap-3"><svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg> <!></div> <!> <div class="space-y-4"><div class="grid grid-cols-2 gap-3"><!> <!> <!> <!></div> <!></div></div></div></div>`);

export default function StackVertical($$anchor, $$props) {
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
			color: selectedColor
		};

		$.set(toasts, [...$.get(toasts), newToast], true);
		$.update(nextId);

		// Auto-dismiss after 5 seconds
		const timeoutId = setTimeout(
			() => {
				dismissToast(newToast.id);
			},
			5000
		);

		// Store timeout ID for cleanup
		$.set(toasts, $.get(toasts).map((t) => t.id === newToast.id ? { ...t, timeoutId } : t), true);
	}

	function dismissToast(id) {
		// Clear timeout if it exists
		const toast = $.get(toasts).find((t) => t.id === id);

		if (toast?.timeoutId) {
			clearTimeout(toast.timeoutId);
		}

		$.set(toasts, $.get(toasts).filter((toast) => toast.id !== id), true);
	}

	function handleClose(id) {
		return () => {
			dismissToast(id);
		};
	}

	var div = root();
	var div_1 = $.child(div);

	$.each(div_1, 21, () => $.get(toasts), (toast) => toast.id, ($$anchor, toast) => {
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
				params: { x: 400, duration: 300 },
				class: 'w-64',
				get onclose() {
					return $.get($0);
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

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var node = $.sibling($.child(div_4), 2);

	Heading(node, {
		tag: 'h1',
		class: 'text-3xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Toast Notifications Demo');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var node_1 = $.sibling(div_4, 2);

	P(node_1, {
		class: 'mb-8',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Click the buttons below to trigger toast notifications. Each toast will appear in the top-right corner and automatically dismiss after 5 seconds.');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var div_5 = $.sibling(node_1, 2);
	var div_6 = $.child(div_5);
	var node_2 = $.child(div_6);

	Button(node_2, {
		onclick: () => addToast("green"),
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Success Toast');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		onclick: () => addToast("blue"),
		color: 'blue',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Info Toast');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		onclick: () => addToast("yellow"),
		color: 'yellow',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Warning Toast');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		onclick: () => addToast("red"),
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Error Toast');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var node_6 = $.sibling(div_6, 2);

	Button(node_6, {
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

	$.reset(div_5);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}