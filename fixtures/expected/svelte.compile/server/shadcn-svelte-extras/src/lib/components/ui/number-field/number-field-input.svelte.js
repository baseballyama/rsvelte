import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { useNumberFieldInput } from './number-field.svelte.js';

export default function Number_field_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, class: className, $$slots, $$events, ...rest } = $$props;
		const inputState = useNumberFieldInput();

		$$renderer.push(`<input${$.attributes(
			{
				class: $.clsx(cn('aria-invalid:border-destructive border-border h-9 flex-1 rounded-md border px-4 text-center outline-none', className)),
				'data-slot': 'number-field-input',
				value: inputState.rootState.opts.value.current,
				...inputState.props,
				...rest
			},
			'svelte-1xawprr',
			void 0,
			void 0,
			4
		)}/>`);

		$.bind_props($$props, { ref });
	});
}