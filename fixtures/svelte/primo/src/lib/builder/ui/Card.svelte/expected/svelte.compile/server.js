import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import Icon from '@iconify/svelte';
import { get, set } from 'idb-keyval';
import * as Avatar from '$lib/components/ui/avatar/index.js';

export default function Card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {any} [id]
		 * @property {any} [title]
		 * @property {boolean} [minimal]
		 * @property {string} [icon]
		 * @property {any} [pill]
		 * @property {import('svelte').Snippet} [body]
		 * @property {import('svelte').Snippet} [children]
		 * @property {import('svelte').Snippet<[any]>} [footer]
		 */
		/** @type {Props} */
		let {
			id = null,
			title = null,
			minimal = false,
			icon = '',
			pill = null,
			body,
			children,
			footer
		} = $$props;

		let hidden = false;

		onDestroy(() => {
			if (title) {
				set(title, hidden);
			}
		});

		$$renderer.push(`<div${$.attr_class('Card svelte-4b7mq8', void 0, { 'minimal': minimal })}${$.attr('id', id)}><div>`);

		if (title) {
			$$renderer.push(`<!--[0--><button class="header-button svelte-4b7mq8"><header class="svelte-4b7mq8"><div style="display: flex; align-items: center; gap: 0.5rem;">`);

			if (title) {
				$$renderer.push(`<!--[0--><span class="title svelte-4b7mq8">${$.escape(title)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (icon) {
				$$renderer.push('<!--[0-->');
				Icon($$renderer, { icon });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (pill) {
				$$renderer.push(`<!--[0--><span class="pill svelte-4b7mq8">${$.escape(pill)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (hidden) {
				$$renderer.push('<!--[0-->');
				Icon($$renderer, { icon: 'ph:caret-down-bold' });
			} else {
				$$renderer.push('<!--[-1-->');
				Icon($$renderer, { icon: 'ph:caret-up-bold' });
			}

			$$renderer.push(`<!--]--></header></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (!hidden) {
			$$renderer.push(`<!--[0--><div class="card-body svelte-4b7mq8">`);
			body?.($$renderer);
			$$renderer.push(`<!----> `);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		footer?.($$renderer, { class: 'card-footer' });
		$$renderer.push(`<!----></div></div>`);
	});
}