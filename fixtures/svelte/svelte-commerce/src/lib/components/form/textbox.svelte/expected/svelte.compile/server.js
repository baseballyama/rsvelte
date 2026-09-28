import * as $ from 'svelte/internal/server';
import { Input } from '$lib/components/ui/input';
import { cn } from '$lib/core/utils';
import Label from '../ui/label/label.svelte';
import { FormTextboxRenderer } from '$lib/core/composables/index.js';
import { AlertCircle, Eye, EyeOff } from '@lucide/svelte';

export default function Textbox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const // One id shared by the <Label for> and the <Input id> so the field actually has an accessible
		// name. Prefer a caller-supplied id, then `name` (call sites that already hand-roll an outer
		// <label for="identifier"> pass name="identifier", so those associate for free), then an
		// SSR-stable generated one.
		uid = $.props_id($$renderer);

		let {
			label,
			error,
			schema,
			validateOnChange = true,
			value = void 0,
			class: className = '',
			optional = false,
			info = '',
			success = false,
			type: initialType = 'text',
			validityChange = () => {},
			$$slots,
			$$events,
			...props
		} = $$props;

		// One id shared by the <Label for> and the <Input id> so the field actually has an accessible
		// name. Prefer a caller-supplied id, then `name` (call sites that already hand-roll an outer
		// <label for="identifier"> pass name="identifier", so those associate for free), then an
		// SSR-stable generated one.
		const inputId = $.derived(() => props.id ?? props.name ?? uid);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function content(
					$$renderer,
					{
						showPassword,
						type,
						touched,
						validationError,
						isValid,
						handleInput,
						togglePassword
					}
				) {
					$$renderer.push(`<div class="mb-3 space-y-2">`);

					if (label) {
						$$renderer.push('<!--[0-->');

						Label($$renderer, {
							for: inputId(),
							class: 'block text-sm font-medium',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(label)} `);

								if (optional) {
									$$renderer.push(`<!--[0--><span class="text-xs text-muted-foreground">(Optional)</span>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="relative">`);

					Input($$renderer, $.spread_props([
						props,
						{
							id: inputId(),
							type,
							oninput: (e) => {
								handleInput(e);
								props.oninput?.(e);
							},

							class: cn(className, 'w-full', touched
								? isValid
									? 'border-green-500 focus:border-green-500'
									: 'border-red-500 focus:border-red-500'
								: 'border-gray-200'),

							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							}
						}
					]));

					$$renderer.push(`<!----> `);

					if (initialType === 'password') {
						$$renderer.push(`<!--[0--><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 transform"${$.attr('aria-label', showPassword ? 'Hide password' : 'Show password')}${$.attr('aria-controls', inputId())}>`);

						if (showPassword) {
							$$renderer.push('<!--[0-->');
							EyeOff($$renderer, { class: 'h-4 w-4 text-gray-500 hover:text-gray-700' });
						} else {
							$$renderer.push('<!--[-1-->');
							Eye($$renderer, { class: 'h-4 w-4 text-gray-500 hover:text-gray-700' });
						}

						$$renderer.push(`<!--]--></button>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> `);

					if ((validationError || error) && touched) {
						$$renderer.push(`<!--[0--><div class="mt-1 flex items-center space-x-1">`);
						AlertCircle($$renderer, { class: 'h-4 w-4 text-destructive' });
						$$renderer.push(`<!----> <p class="text-sm font-medium text-destructive">${$.escape(validationError || (Array.isArray(error) ? error[0] : error))}</p></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (info) {
						$$renderer.push(`<!--[0--><p class="text-xs text-muted-foreground">${$.escape(info)}</p>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				FormTextboxRenderer($$renderer, {
					error,
					schema,
					validityChange,
					initialType,
					validateOnChange,
					content,
					$$slots: { content: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}