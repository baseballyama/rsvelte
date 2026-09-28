import * as $ from 'svelte/internal/server';
import { Command } from "bits-ui";

export default function Sub_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { shortcut, children } = $$props;

		if (Command.Item) {
			$$renderer.push('<!--[-->');

			Command.Item($$renderer, {
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!----> <div data-command-raycast-submenu-shortcuts=""><!--[-->`);

					const each_array = $.ensure_array_like(shortcut.split(" "));

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let key = each_array[i];

						$$renderer.push(`<kbd>${$.escape(key)}</kbd>`);
					}

					$$renderer.push(`<!--]--></div>`);
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