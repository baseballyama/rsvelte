import * as $ from 'svelte/internal/server';
import { PaginationRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';
import { splitEllipsisProps } from '@zag-js/pagination';

export default function Ellipsis($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const pagination = PaginationRootContext.consume();

		const $$d = $.derived(() => splitEllipsisProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			ellipsisProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const attributes = $.derived(() => mergeProps(pagination().getEllipsisProps(ellipsisProps()), rest()));

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}