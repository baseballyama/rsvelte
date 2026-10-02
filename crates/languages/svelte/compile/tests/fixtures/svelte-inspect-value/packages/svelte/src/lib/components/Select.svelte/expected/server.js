import * as $ from 'svelte/internal/server';
import { useOptions } from '../options.svelte.js';
import { slide } from '../transition/index.js';

export default function Select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			onclick,
			value = undefined,
			prefix,
			containerAttrs = {},
			$$slots,
			$$events,
			...rest
		} = $$props;

		const options = useOptions();
		let button = void 0;

		function focus() {
			button?.focus();
		}

		$$renderer.push(`<div${$.attributes({ class: 'inspect-select', ...containerAttrs }, 'svelte-1m3mdsy', { 'with-prefix': prefix })}>`);

		if (prefix) {
			$$renderer.push(`<!--[0--><div class="prefix svelte-1m3mdsy">${$.escape(prefix)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		$$renderer.select(
			{ this: button, value, ...rest },
			($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			'svelte-1m3mdsy',
			{ prefixed: prefix != null },
			void 0,
			void 0,
			true
		);

		$$renderer.push(`</div>`);
		$.bind_props($$props, { value, focus });
	});
}