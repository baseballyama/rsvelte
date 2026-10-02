import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';
import { Textarea } from '$lib/components/ui/textarea';
import { serializeEvent } from './utils';
import { imperativeBus } from '$lib/imperative.svelte';
import { getContext, untrack } from 'svelte';

export default function TextArea($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onDispatch } = $$props;

		const $$d = $.derived(useTypedNode(() => ({ nodeId, uiTree, type: 'Form.TextArea' }))),
			componentProps = $.derived(() => $$d().props);

		const { register } = getContext('form-context');
		const isControlled = $.derived(() => componentProps()?.value !== undefined);
		let internalValue = '';
		let isInitialized = false;
		let textareaRef = null;
		const displayValue = $.derived(() => isControlled() ? componentProps()?.value : internalValue);

		function onInput(e) {
			const newValue = e.target.value;

			if (!isControlled()) {
				internalValue = newValue;
			}

			onDispatch(nodeId, 'onChange', [newValue]);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (componentProps()) {
				$$renderer.push(`<!--[0--><div class="flex gap-4"><label${$.attr('for', componentProps().id)} class="text-muted-foreground pt-2 text-right text-sm font-medium">${$.escape(componentProps().title)}</label> <div class="w-full">`);

				Textarea($$renderer, {
					id: componentProps().id,
					placeholder: componentProps().placeholder,
					value: displayValue() ?? '',
					oninput: onInput,
					onblur: (e) => onDispatch(nodeId, 'onBlur', [serializeEvent(componentProps().id, e)]),
					'aria-invalid': !!componentProps().error,
					get ref() {
						return textareaRef;
					},

					set ref($$value) {
						textareaRef = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				if (componentProps().error) {
					$$renderer.push(`<!--[0--><p class="mt-1 text-xs text-red-600">${$.escape(componentProps().error)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (componentProps().info) {
					$$renderer.push(`<!--[0--><p class="mt-1 text-xs text-gray-500">${$.escape(componentProps().info)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}