import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toast, Button } from "flowbite-svelte";
import { slide } from "svelte/transition";
import { CheckCircleSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="flex gap-10"><!> <!></div>`);

export default function Autohide($$anchor) {
	let toastStatus = true;
	let counter = 6;

	function trigger() {
		toastStatus = true;
		counter = 6;
		timeout();
	}

	function timeout() {
		if (--counter > 0) return setTimeout(timeout, 1000);

		toastStatus = false;
	}

	var div = root();
	var node = $.child(div);

	Button(node, {
		onclick: trigger,
		class: 'my-3',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Restart');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		const icon = ($$anchor) => {
			CheckCircleSolid($$anchor, { class: 'h-5 w-5' });
		};

		Toast(node_1, {
			dismissable: false,
			get transition() {
				return slide;
			},

			get toastStatus() {
				return toastStatus;
			},

			set toastStatus($$value) {
				toastStatus = $$value;
			},
			icon,
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, `Autohide in ${counter ?? ''}s.`));
				$.append($$anchor, text_1);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
}