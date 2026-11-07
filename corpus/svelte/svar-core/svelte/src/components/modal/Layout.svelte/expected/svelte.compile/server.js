import * as $ from 'svelte/internal/server';
import { onMount, getContext } from "svelte";
import { fade } from "svelte/transition";
import Button from "../Button.svelte";

export default function Layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const _ = getContext("wx-i18n").getGroup("core");

		const {
			title = "",
			buttons = ["cancel", "ok"],
			header,
			children,
			footer,
			onconfirm,
			oncancel
		} = $$props;

		function keydown(ev) {
			switch (ev.code) {
				case "Enter":
					{
						const from = ev.target.tagName;

						if (from === "TEXTAREA" || from === "BUTTON") return;

						onconfirm && onconfirm({ ev });

						break;
					}

				case "Escape":
					oncancel && oncancel({ ev });
					break;
			}
		}

		function onclick(ev, button) {
			const pack = { ev, button };

			if (button === "cancel") {
				oncancel && oncancel(pack);
			} else {
				onconfirm && onconfirm(pack);
			}
		}

		let modal;

		onMount(() => {
			modal.focus();
		});

		$$renderer.push(`<div class="wx-modal svelte-mkj13s" tabindex="0"><div class="wx-window svelte-mkj13s">`);

		if (header) {
			$$renderer.push('<!--[0-->');
			header($$renderer);
			$$renderer.push(`<!---->`);
		} else if (title) {
			$$renderer.push(`<!--[1--><div class="wx-header svelte-mkj13s">${$.escape(title)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div>`);
		children($$renderer);
		$$renderer.push(`<!----></div> `);

		if (footer) {
			$$renderer.push('<!--[0-->');
			footer($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div class="wx-buttons svelte-mkj13s"><!--[-->`);

			const each_array = $.ensure_array_like(buttons);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let button = each_array[$$index];

				$$renderer.push(`<div class="wx-button svelte-mkj13s">`);

				Button($$renderer, {
					type: `block ${button === 'ok' ? 'primary' : 'secondary'}`,
					onclick: (ev) => onclick(ev, button),
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(_(button))}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}