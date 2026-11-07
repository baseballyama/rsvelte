import * as $ from 'svelte/internal/server';
import { useTagsInput } from '../modules/provider.svelte';
import { TagsInputRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';
import { splitProps } from '@zag-js/tags-input';

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		const { $$slots, $$events, ...props } = $$props;

		const $$d = $.derived(() => splitProps(props)),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			tagsInputProps = $.derived(() => $$derived_array()[0]),
			componentProps = $.derived(() => $$derived_array()[1]);

		const element = $.derived(() => componentProps().element),
			children = $.derived(() => componentProps().children),
			rest = $.derived(() => $.exclude_from_object(componentProps(), ['element', 'children']));

		const tagsInput = useTagsInput(() => ({ ...tagsInputProps(), id }));
		const attributes = $.derived(() => mergeProps(tagsInput().getRootProps(), rest()));

		TagsInputRootContext.provide(() => tagsInput());

		if (element()) {
			$$renderer.push('<!--[0-->');
			element()($$renderer, attributes());
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...attributes() })}>`);
			children()?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}