import * as $ from 'svelte/internal/server';
import { useMutationObserver } from "runed";
import { DemoContainer } from "@svecodocs/kit";

export default function Use_mutation_observer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let el = null;
		const messages = [];
		let className = "";
		let style = "";

		useMutationObserver(
			() => el,
			(mutations) => {
				const mutation = mutations[0];

				if (!mutation) return;

				messages.push(mutation.attributeName);
			},
			{ attributes: true }
		);

		setTimeout(
			() => {
				className = "text-brand";
			},
			1000
		);

		setTimeout(
			() => {
				style = "font-style: italic;";
			},
			1500
		);

		DemoContainer($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div${$.attr_class($.clsx(className))}${$.attr_style(style)}>`);

				const each_array = $.ensure_array_like(messages);

				if (each_array.length !== 0) {
					$$renderer.push('<!--[-->');

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let text = each_array[i];

						$$renderer.push(`<div>Mutation Attribute: ${$.escape(text)}</div>`);
					}
				} else {
					$$renderer.push(`<!--[!--><div>No mutations yet</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});
	});
}