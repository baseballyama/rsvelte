import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { box, mergeProps } from 'svelte-toolbelt';
import { usePasswordInput } from './password.svelte.js';
import { Input } from '$lib/components/ui/input';

export default function Password_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = '',
			class: className,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const state = usePasswordInput({
			value: box.with(() => value, (v) => value = v),
			ref: box.with(() => ref)
		});

		const mergedProps = $.derived(() => mergeProps(rest, state.props));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="relative">`);

			Input($$renderer, $.spread_props([
				mergedProps(),
				{
					type: state.root.opts.hidden.current ? 'password' : 'text',
					class: cn(
						'transition-[width]',
						{
							'pr-9': state.root.passwordState.copyMounted || state.root.passwordState.toggleMounted,
							'pr-[4.5rem]': state.root.passwordState.copyMounted && state.root.passwordState.toggleMounted
						},
						className
					),

					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					}
				}
			]));

			$$renderer.push(`<!----> `);
			children?.($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref, value });
	});
}