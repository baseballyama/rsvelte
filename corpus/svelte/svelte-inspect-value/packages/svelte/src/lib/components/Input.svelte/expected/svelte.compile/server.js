import * as $ from 'svelte/internal/server';
import { useOptions } from '../options.svelte.js';
import { slide } from '../transition/index.js';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const options = useOptions();

		let {
			busy,
			disabled,
			value = '',
			class: className,
			transition = slide,
			transitionParams = { duration: options.transitionDuration },
			containerAttrs = {},
			icon,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let input = void 0;

		function focus() {
			input?.focus();
		}

		$$renderer.push(`<div${$.attributes({ class: 'siv-input', ...containerAttrs }, 'svelte-x5on4q')}><input${$.attributes(
			{
				value,
				class: $.clsx(className),
				type: 'text',
				disabled: disabled || busy,
				'aria-busy': busy,
				...rest
			},
			'svelte-x5on4q',
			void 0,
			void 0,
			4
		)}/> `);

		if (icon) {
			$$renderer.push(`<!--[0--><div class="icon svelte-x5on4q">`);
			icon($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value, focus });
	});
}