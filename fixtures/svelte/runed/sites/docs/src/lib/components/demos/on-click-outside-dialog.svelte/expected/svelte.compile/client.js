import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, DemoContainer } from "@svecodocs/kit";
import { onClickOutside } from "runed";

var root = $.from_html(
	`<!> <dialog class="bg-background fixed left-1/2 top-1/2 m-0 -translate-x-1/2 -translate-y-1/2 transform rounded-xl border-none p-0 shadow-lg backdrop:bg-black/50"><div class="min-w-[360px] max-w-[400px] rounded-xl p-8"><p class="mb-4">This is a dialog.</p> <p class="mb-4">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Neque sunt aut sit exercitationem
				deleniti doloremque quo quasi, expedita omnis dicta eaque, eveniet nesciunt nobis sint
				atque? Praesentium facilis officiis perferendis.</p> <!></div></dialog>`,
	1
);

export default function On_click_outside_dialog($$anchor, $$props) {
	$.push($$props, true);

	let dialog = $.state(void 0);

	const clickOutside = onClickOutside(
		() => $.get(dialog),
		() => {
			$.get(dialog).close();
			clickOutside.stop();
		},
		{ immediate: false }
	);

	function openDialog() {
		$.get(dialog).showModal();
		clickOutside.start();
	}

	function closeDialog() {
		$.get(dialog).close();
		clickOutside.stop();
	}

	DemoContainer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				size: 'sm',
				onclick: openDialog,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Open Dialog');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var dialog_1 = $.sibling(node, 2);
			var div = $.child(dialog_1);
			var node_1 = $.sibling($.child(div), 4);

			Button(node_1, {
				size: 'sm',
				variant: 'outline',
				onclick: closeDialog,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Close Dialog');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.reset(dialog_1);
			$.bind_this(dialog_1, ($$value) => $.set(dialog, $$value), () => $.get(dialog));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}