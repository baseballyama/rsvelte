import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { THEME_CONTEXT } from '$lib/constants';
import { getContext } from 'svelte';

var root = $.from_html(`<kbd role="button"><!></kbd>`);

export default function KeyboardButton($$anchor, $$props) {
	$.push($$props, true);

	const $themeCtx = () => $.store_get(themeCtx, '$themeCtx', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const handleButtonClick = (event) => {
		event.stopPropagation();
		$$props.onKeyboardButtonClicked?.({ event });
	};

	const themeCtx = getContext(THEME_CONTEXT);
	const { unstyled, keyboardButtonClass, keyboardButtonStyle } = $themeCtx();
	var kbd = root();
	let classes;
	var node = $.child(kbd);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(kbd);

	$.template_effect(() => {
		$.set_attribute(kbd, 'tabindex', $$props.onKeyboardButtonClicked ? 0 : -1);
		$.set_style(kbd, keyboardButtonStyle);
		classes = $.set_class(kbd, 1, $.clsx(keyboardButtonClass), 'svelte-1x8w717', classes, { 'cp-kbd': !unstyled });
	});

	$.delegated('click', kbd, handleButtonClick);
	$.delegated('keydown', kbd, (e) => e.key === 'Enter' && handleButtonClick(e));
	$.append($$anchor, kbd);
	$.pop();
	$$cleanup();
}

$.delegate(['click', 'keydown']);