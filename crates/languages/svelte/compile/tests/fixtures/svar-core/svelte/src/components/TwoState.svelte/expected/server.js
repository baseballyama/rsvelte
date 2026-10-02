import * as $ from 'svelte/internal/server';
import Button from "./Button.svelte";

export default function TwoState($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = false,
			type = "",
			icon = "",
			disabled = false,
			iconActive = "",
			onclick,
			title = "",
			tooltip,
			css = "",
			text = "",
			textActive = "",
			children,
			active,
			onchange
		} = $$props;

		let typeStr = $.derived(() => (value ? "pressed" : "") + (type ? " " + type : ""));

		function handleClick(ev) {
			let next = !value;

			if (onclick) onclick(ev);

			if (!ev.defaultPrevented) {
				value = next;
				onchange && onchange({ value });
			}
		}

		if (value && active) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				title,
				tooltip,
				text: value && textActive || text,
				css,
				type: typeStr(),
				icon: value && iconActive || icon,
				onclick: handleClick,
				disabled,
				children: ($$renderer) => {
					active($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		} else if (children) {
			$$renderer.push('<!--[1-->');

			Button($$renderer, {
				title,
				tooltip,
				text: value && textActive || text,
				css,
				type: typeStr(),
				icon: value && iconActive || icon,
				onclick: handleClick,
				disabled,
				children: ($$renderer) => {
					children($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');

			Button($$renderer, {
				title,
				tooltip,
				text: value && textActive || text,
				css,
				type: typeStr(),
				icon: value && iconActive || icon,
				onclick: handleClick,
				disabled
			});
		}

		$$renderer.push(`<!--]-->`);
	});
}