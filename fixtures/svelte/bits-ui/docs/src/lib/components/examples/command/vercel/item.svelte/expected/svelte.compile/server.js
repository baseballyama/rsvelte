import * as $ from 'svelte/internal/server';
import { Command } from "bits-ui";

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { shortcut = "", onSelect = () => {}, value, children } = $$props;

		if (Command.Item) {
			$$renderer.push('<!--[-->');

			Command.Item($$renderer, {
				onSelect,
				value,
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!----> `);

					if (shortcut) {
						$$renderer.push(`<!--[0--><div data-command-vercel-shortcuts=""><!--[-->`);

						const each_array = $.ensure_array_like(shortcut.split(" "));

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let key = each_array[$$index];

							$$renderer.push(`<kbd>${$.escape(key)}</kbd>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}