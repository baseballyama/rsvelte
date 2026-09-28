import * as $ from 'svelte/internal/server';
import LinkIcon from './icons/LinkIcon.svelte';
import { useOptions } from '../options.svelte.js';
import { collapseString, stringify } from '../util.js';
import Highlight from './Highlight.svelte';

export default function StringValue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, display, type = 'string' } = $$props;
		const options = useOptions();

		const $$d = $.derived(() => options.value),
			stringCollapse = $.derived(() => $$d().stringCollapse),
			quotes = $.derived(() => $$d().quotes);

		let displayOrValue = $.derived(() => display != null ? display : value);
		let isUrlOrPath = $.derived(() => (type === 'string' || type === 'url') && (URL.canParse(displayOrValue()) || displayOrValue().startsWith('/') || value.startsWith('data:')));
		let ele = $.derived(() => isUrlOrPath() ? 'a' : 'span');
		let collapsed = $.derived(() => collapseString(displayOrValue(), stringCollapse()));
		let stringified = $.derived(() => stringify(collapsed(), 0, quotes()));

		$.element(
			$$renderer,
			ele(),
			() => {
				$$renderer.push(` data-testid="value"${$.attr_class(
					$.clsx([
						'stringvalue',
						' value',
						type,
						isUrlOrPath() && 'url-or-path'
					]),
					'svelte-wi40ck'
				)}${$.attr('title', stringify(value))}${$.attr('href', isUrlOrPath() ? value : null)}${$.attr('target', isUrlOrPath() ? '_blank' : null)}${$.attr('rel', isUrlOrPath() ? 'noreferrer' : null)}`);
			},
			() => {
				Highlight($$renderer, { value: stringified(), fields: ['value'], alsoMatch: value });
				$$renderer.push(`<!---->`);

				if (isUrlOrPath()) {
					$$renderer.push(`<!--[0--><span class="value url">`);
					LinkIcon($$renderer, {});
					$$renderer.push(`<!----></span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}
		);
	});
}