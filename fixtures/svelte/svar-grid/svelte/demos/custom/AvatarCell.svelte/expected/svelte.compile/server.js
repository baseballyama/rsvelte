import * as $ from 'svelte/internal/server';
import { Avatar } from "@svar-ui/svelte-core";

export default function AvatarCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row, data, column } = $$props;

		const userData = $.derived(() => {
			if (data) return data;

			const users = column.options;
			const options = row["assigned"]?.map((id) => users.find((user) => user.id === id));

			if (options?.length === 1) {
				return options[0];
			}

			return options;
		});

		const names = $.derived(() => {
			if (Array.isArray(userData()) && userData().length) {
				return userData().map((user) => user.name).join(", ");
			}

			return "";
		});

		$$renderer.push(`<div class="container svelte-a8wcp2"><!---->`);

		{
			if (Array.isArray(userData())) {
				$$renderer.push('<!--[0-->');

				if (userData().length < 3) {
					$$renderer.push(`<!--[0-->${$.escape(names())}`);
				} else {
					$$renderer.push('<!--[-1-->');
					Avatar($$renderer, { value: userData(), size: 22 });
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
				Avatar($$renderer, { value: userData(), size: 28 });
				$$renderer.push(`<!----> <div>${$.escape(userData()?.name ?? "")}</div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!----></div>`);
	});
}