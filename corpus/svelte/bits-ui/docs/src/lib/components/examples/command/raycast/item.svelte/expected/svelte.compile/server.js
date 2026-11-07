import * as $ from 'svelte/internal/server';
import { Command } from "bits-ui";

export default function Item($$renderer, $$props) {
	let { value, isCommand = false, onSelect, keywords, children } = $$props;

	if (Command.Item) {
		$$renderer.push('<!--[-->');

		Command.Item($$renderer, {
			value,
			onSelect,
			keywords,
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!----> <span data-command-raycast-meta="">`);

				if (isCommand) {
					$$renderer.push(`<!--[0-->Command`);
				} else {
					$$renderer.push(`<!--[-1-->Application`);
				}

				$$renderer.push(`<!--]--></span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}