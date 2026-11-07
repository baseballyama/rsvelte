import * as $ from 'svelte/internal/server';
import { onMount, getContext } from "svelte";
import { fade } from "svelte/transition";
import Button from "./Button.svelte";
import { defaultLocale } from "./helpers/locale";

export default function Modal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const _ = (getContext("wx-i18n") || defaultLocale()).getGroup("core");

		const {
			title = "",
			buttons = ["cancel", "ok"],
			header,
			children,
			footer,
			css = "",
			onconfirm,
			oncancel
		} = $$props;

		function keydown(ev) {
			switch (ev.code) {
				case "Enter":
					{
						const from = ev.target.tagName;

						if (from === "TEXTAREA" || from === "BUTTON") return;

						onconfirm && onconfirm({ event: ev });

						break;
					}

				case "Escape":
					oncancel && oncancel({ event: ev });
					break;
			}
		}

		function onclick(ev, button) {
			const pack = { event: ev, button };

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

		$$renderer.push(`<div${$.attr_class(`wx-modal ${$.stringify(css)}`, 'svelte-fhpbhj')} tabindex="0"><div class="wx-window svelte-fhpbhj">`);

		if (header) {
			$$renderer.push('<!--[0-->');
			header($$renderer);
			$$renderer.push(`<!---->`);
		} else if (title) {
			$$renderer.push(`<!--[1--><div class="wx-header svelte-fhpbhj">${$.escape(title)}</div>`);
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
		} else if (buttons) {
			$$renderer.push(`<!--[1--><div class="wx-buttons svelte-fhpbhj"><!--[-->`);

			const each_array = $.ensure_array_like(buttons);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let button = each_array[$$index];

				$$renderer.push(`<div class="wx-button svelte-fhpbhj">`);

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
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}