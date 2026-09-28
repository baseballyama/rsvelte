import * as $ from 'svelte/internal/server';
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';
import Icon from '@iconify/svelte';
import UI from '../../ui';
import { mod_key_held } from '../../stores/app/misc';

export default function ToolbarButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const dispatch = createEventDispatcher();

		/**
		 * @typedef {Object} Props
		 * @property {any} [id]
		 * @property {string} [title]
		 * @property {string | null} [label]
		 * @property {any} [key]
		 * @property {any} [icon]
		 * @property {any} [svg]
		 * @property {boolean} [disabled]
		 * @property {any} [onclick]
		 * @property {boolean} [loading]
		 * @property {boolean} [active]
		 * @property {any} [buttons]
		 * @property {any} [type]
		 * @property {string} [style]
		 * @property {import('svelte').Snippet} [children]
		 */
		/** @type {Props} */
		let {
			id = null,
			title = '',
			label = null,
			key = null,
			icon = null,
			svg = null,
			disabled = false,
			onclick = null,
			loading = false,
			active = false,
			buttons = null,
			type = null,
			style = '',
			children
		} = $$props;

		let subButtonsActive = false;

		$$renderer.push(`<button${$.attr('id', id)}${$.attr('aria-label', title)}${$.attr_class('primo-button svelte-1kqoqrl', void 0, {
			'primo': type === 'primo',
			'active': active,
			'has-subbuttons': buttons,
			'has-icon-button': !label && icon
		})}${$.attr_style(style)}${$.attr('disabled', disabled, true)}>`);

		if (icon || svg) {
			$$renderer.push('<!--[0-->');

			if (loading) {
				$$renderer.push('<!--[0-->');

				if (UI.Spinner) {
					$$renderer.push('<!--[-->');
					UI.Spinner($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else if (label && svg) {
				$$renderer.push(`<!--[1--><div${$.attr_class('svg', void 0, {
					'invisible': key && $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)
				})}>${$.html(svg)}</div> <span${$.attr_class('label', void 0, {
					'invisible': key && $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)
				})}>${$.escape(label)}</span>`);
			} else if (label && icon) {
				$$renderer.push('<!--[2-->');

				Icon($$renderer, {
					icon,
					class: key && $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) ? 'invisible' : ''
				});

				$$renderer.push(`<!----> <span${$.attr_class('label', void 0, {
					'invisible': key && $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)
				})}>${$.escape(label)}</span>`);
			} else if (svg) {
				$$renderer.push(`<!--[3--><div${$.attr_class('svg', void 0, {
					'invisible': key && $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)
				})}>${$.html(svg)}</div>`);
			} else if (icon) {
				$$renderer.push('<!--[4-->');

				Icon($$renderer, {
					icon,
					class: key && $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) ? 'invisible' : ''
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (key && $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held) && !loading) {
				$$renderer.push(`<!--[0--><span class="key-hint svelte-1kqoqrl" aria-hidden="">⌘${$.escape(key.toUpperCase())}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else if (children) {
			$$renderer.push('<!--[1-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span>${$.escape(label)}</span>`);
		}

		$$renderer.push(`<!--]--></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}