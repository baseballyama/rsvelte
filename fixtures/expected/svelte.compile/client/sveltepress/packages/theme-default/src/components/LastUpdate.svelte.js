import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import themeOptions from 'virtual:sveltepress/theme-default';

var root = $.from_html(`<div class="last-update svelte-ctu6kd"> </div>`);

export default function LastUpdate($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {object} Props
	 * @property {string} [lastUpdate] - Last update time
	 */
	/** @type {Props} */
	const lastUpdate = $.prop($$props, 'lastUpdate', 3, '');

	const DEFAULT_TEXT = 'Last update at:';
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var text = $.only_child(div);

			$.template_effect(
				($0) => $.set_text(text, `${(themeOptions.i18n?.lastUpdateAt || DEFAULT_TEXT) ?? ''}
    ${$0 ?? ''}`),
				[() => lastUpdate().replace(/:\d{2}$/, '')]
			);

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (lastUpdate()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}