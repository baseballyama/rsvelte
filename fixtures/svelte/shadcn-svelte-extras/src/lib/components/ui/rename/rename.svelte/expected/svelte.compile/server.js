import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { box } from 'svelte-toolbelt';
import { useRenameInput } from './rename.svelte.js';

export default function Rename($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = uid,
			this: tagName,
			inputTag = 'input',
			mode = 'view',
			value = void 0,
			class: className,
			blurBehavior,
			fallbackSelectionBehavior = 'end',
			inputClass,
			textClass,
			onSave = () => {},
			onCancel = () => {},
			validate = () => true
		} = $$props;

		let inputRef = null;
		let textRef = null;

		const rootState = useRenameInput({
			id,
			mode: box.with(() => mode, (v) => mode = v),
			value: box.with(() => value, (v) => value = v),
			inputRef: box.with(() => inputRef, (v) => inputRef = v),
			textRef: box.with(() => textRef, (v) => textRef = v),
			onSave,
			onCancel,
			blurBehavior: box.with(() => blurBehavior),
			validate,
			fallbackSelectionBehavior: box.with(() => fallbackSelectionBehavior)
		});

		const commonClass = cn('text-base min-w-0 w-full');

		const inputProps = $.derived(() => ({
			'data-mode': 'edit',
			id,
			class: cn(commonClass, 'border-border rounded-md border outline-none', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', className, inputClass),
			'aria-invalid': rootState.invalid,
			onkeydown: rootState.onInputKeydown,
			onblur: rootState.onInputBlur
		}));

		if (mode === 'edit') {
			$$renderer.push('<!--[0-->');

			if (inputTag === 'textarea') {
				$$renderer.push(`<!--[0--><textarea${$.attributes({ ...inputProps() })}>`);

				const $$body = $.escape(rootState.editingValue);

				if ($$body) {
					$$renderer.push(`${$$body}`);
				} else {}

				$$renderer.push(`</textarea>`);
			} else {
				$$renderer.push(`<!--[-1--><input${$.attributes(
					{
						type: 'text',
						autocomplete: 'off',
						value: rootState.editingValue,
						...inputProps()
					},
					void 0,
					void 0,
					void 0,
					4
				)}/>`);
			}

			$$renderer.push(`<!--]-->`);
		} else if (mode === 'view') {
			$$renderer.push('<!--[1-->');

			$.element(
				$$renderer,
				tagName,
				() => {
					$$renderer.push(`${$.attr('id', id)} data-mode="view"${$.attr_class($.clsx(cn(commonClass, className, textClass)))}`);
				},
				() => {
					$$renderer.push(`${$.escape(value)}`);
				}
			);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { mode, value });
	});
}