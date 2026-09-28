import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';
import { tick, onMount, createEventDispatcher } from 'svelte';
import autosize from 'autosize';

export default function TextInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		/**
		 * @typedef {Object} Props
		 * @property {string | null} [id]
		 * @property {string | null} [label]
		 * @property {string} [prefix]
		 * @property {string} [prefix_icon]
		 * @property {any} value
		 * @property {string} [placeholder]
		 * @property {string} [variants]
		 * @property {string} [type]
		 * @property {boolean} [autofocus]
		 * @property {string} [selection]
		 * @property {boolean} [grow]
		 * @property {boolean} [disabled]
		 * @property {any} [options]
		 * @property {{ label: string, onclick?: function, type?: string, disabled?: boolean } | null} [button]
		 * @property {() => void} [oninput]?
		 * @property {() => void} [onblur]?
		 * @property {() => void} [onkeydown]?
		 * @property {() => void} [onfocus]?
		 */
		/** @type {Props} */
		let {
			id = null,
			label = null,
			prefix = '',
			prefix_icon = '',
			value = void 0,
			placeholder = '',
			variants = '',
			type = 'text',
			autofocus = false,
			selection = '',
			grow = false,
			disabled = false,
			options = [],
			button = null,
			oninput = () => {},
			onblur = () => {},
			onkeydown = () => {},
			onfocus = () => {},
			element = void 0
		} = $$props;

		let textarea_element = void 0;

		onMount(() => {
			if (textarea_element) {
				autosize(textarea_element);
			}

			// autofocus attribute doesn't work so doing this
			if (autofocus) {
				tick().then(() => {
					(textarea_element || element)?.focus();
				});
			}
		});

		$$renderer.push(`<label${$.attr_class(`TextInput ${$.stringify(variants)}`, 'svelte-a16uxj')}${$.attr('id', id)}>`);

		if (label) {
			$$renderer.push(`<!--[0--><span class="primo--field-label svelte-a16uxj">${$.escape(label)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div style="display: flex;width: 100%;gap: 0.5rem;">`);

		if (options.length > 0) {
			$$renderer.push('<!--[0-->');

			$$renderer.select(
				{
					class: 'options',
					onchange: (e) => dispatch('select', { value: e?.target?.value }),
					value: selection
				},
				($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(options);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let option = each_array[$$index];

						$$renderer.option(
							{ value: option.value, class: '' },
							($$renderer) => {
								$$renderer.push(`${$.escape(option.label)}`);
							},
							'svelte-a16uxj'
						);
					}

					$$renderer.push(`<!--]-->`);
				},
				'svelte-a16uxj'
			);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="input-container svelte-a16uxj">`);

		if (prefix) {
			$$renderer.push(`<!--[0--><span class="prefix svelte-a16uxj">${$.escape(prefix)}</span>`);
		} else if (prefix_icon) {
			$$renderer.push('<!--[1-->');
			Icon($$renderer, { icon: prefix_icon });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (grow) {
			$$renderer.push(`<!--[0--><textarea rows="1"${$.attr('type', type)}${$.attr('placeholder', placeholder)}${$.attr('disabled', disabled, true)} class="svelte-a16uxj">`);

			const $$body = $.escape(value);

			if ($$body) {
				$$renderer.push(`${$$body}`);
			} else {}

			$$renderer.push(`</textarea>`);
		} else {
			$$renderer.push(`<!--[-1--><input${$.attr('value', value)}${$.attr('type', type)}${$.attr('placeholder', placeholder)}${$.attr('disabled', disabled, true)} class="svelte-a16uxj"/>`);
		}

		$$renderer.push(`<!--]--> `);

		if (button) {
			$$renderer.push(`<!--[0--><button${$.attr('type', button.type)}${$.attr('disabled', button.disabled, true)} class="svelte-a16uxj">${$.escape(button.label)}</button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></label>`);
		$.bind_props($$props, { value, selection, element });
	});
}