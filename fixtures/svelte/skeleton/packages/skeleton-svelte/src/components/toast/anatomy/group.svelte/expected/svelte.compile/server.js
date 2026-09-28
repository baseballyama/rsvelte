import * as $ from 'svelte/internal/server';
import { ToastGroupContext } from '../modules/group-context.js';
import { mergeProps, normalizeProps, useMachine } from '@zag-js/svelte';
import { group } from '@zag-js/toast';

export default function Group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		const { $$slots, $$events, ...props } = $$props;

		const element = $.derived(() => props.element),
			children = $.derived(() => props.children),
			toaster = $.derived(() => props.toaster),
			rest = $.derived(() => $.exclude_from_object(props, ['element', 'children', 'toaster']));

		const service = useMachine(group.machine, () => ({ id, store: toaster() }));
		const api = $.derived(() => group.connect(service, normalizeProps));
		const attributes = $.derived(() => mergeProps(api().getGroupProps(), rest()));

		ToastGroupContext.provide(() => service);

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...attributes() })}><!--[-->`);

			const each_array = $.ensure_array_like(api().getToasts());

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let toast = each_array[index];

				children()?.($$renderer, { ...toast, index });
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}