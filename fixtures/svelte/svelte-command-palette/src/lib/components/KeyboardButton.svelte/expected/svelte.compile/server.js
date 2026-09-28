import * as $ from 'svelte/internal/server';
import { THEME_CONTEXT } from '$lib/constants';
import { getContext } from 'svelte';

export default function KeyboardButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children, onKeyboardButtonClicked } = $$props;

		const handleButtonClick = (event) => {
			event.stopPropagation();
			onKeyboardButtonClicked?.({ event });
		};

		const themeCtx = getContext(THEME_CONTEXT);
		const { unstyled, keyboardButtonClass, keyboardButtonStyle } = $.store_get($$store_subs ??= {}, '$themeCtx', themeCtx);

		$$renderer.push(`<kbd role="button"${$.attr('tabindex', onKeyboardButtonClicked ? 0 : -1)}${$.attr_style(keyboardButtonStyle)}${$.attr_class($.clsx(keyboardButtonClass), 'svelte-1x8w717', { 'cp-kbd': !unstyled })}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></kbd>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}