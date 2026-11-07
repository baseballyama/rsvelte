import * as $ from 'svelte/internal/server';
import FancyList from 'mod';

export default function Let_directive01_input($$renderer) {
	FancyList($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { foo: data }) => {
				$$renderer.push(`<!---->${$.escape(data)} ${$.escape(item)} no-def`);
			},

			item: ($$renderer, { item, item2, item3: bar }) => {
				$$renderer.push(`<div slot="item">${$.escape(item.text)}</div>`);
			}
		}
	});

	$$renderer.push(`<!----> ${$.escape(data)} no-def`);
}