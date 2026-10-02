import * as $ from 'svelte/internal/server';
import FancyList from 'mod';

export default function Let_directive03_input($$renderer) {
	FancyList($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { foo: data }) => {
				$$renderer.push(`<!---->${$.escape(data)}`);
			},

			item: ($$renderer, { item, item2 }) => {
				$$renderer.push(`<div slot="item"${$.attr_class($.clsx(item2.class))}>${$.escape(item.text)}</div>`);
			}
		}
	});
}