import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LocaleProviderRootContext } from '../modules/root-context.js';
import { isRTL } from '@zag-js/i18n-utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Root($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	const children = $.derived(() => $$props.children),
		locale = $.derived(() => $$props.locale);

	LocaleProviderRootContext.provide(() => ({
		locale: $.get(locale),
		dir: isRTL($.get(locale)) ? 'rtl' : 'ltr'
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $.get(children) ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}