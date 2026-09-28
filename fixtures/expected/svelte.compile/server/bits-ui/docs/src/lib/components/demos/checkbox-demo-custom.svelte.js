import * as $ from 'svelte/internal/server';
import { Checkbox, Label, useId } from "bits-ui";
import Check from "phosphor-svelte/lib/Check";
import Minus from "phosphor-svelte/lib/Minus";
import DemoContainer from "../demo-container.svelte";

export default function Checkbox_demo_custom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = useId(),
			checked = false,
			ref = null,
			labelText,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				size: 'xs',
				wrapperClass: 'rounded-bl-card rounded-br-card',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-center space-x-3">`);

					{
						function children($$renderer, { checked, indeterminate }) {
							$$renderer.push(`<div class="text-background inline-flex items-center justify-center">`);

							if (indeterminate) {
								$$renderer.push('<!--[0-->');
								Minus($$renderer, { class: 'size-[15px]', weight: 'bold' });
							} else if (checked) {
								$$renderer.push('<!--[1-->');
								Check($$renderer, { class: 'size-[15px]', weight: 'bold' });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						}

						if (Checkbox.Root) {
							$$renderer.push('<!--[-->');

							Checkbox.Root($$renderer, $.spread_props([
								{
									id,
									'aria-labelledby': 'terms-label',
									class: 'border-muted bg-foreground data-[state=unchecked]:border-border-input data-[state=unchecked]:bg-background data-[state=unchecked]:hover:border-dark-40 data-disabled:cursor-not-allowed data-disabled:opacity-70 data-disabled:pointer-events-none  peer inline-flex size-[25px] items-center justify-center rounded-md border transition-all duration-150 ease-in-out active:scale-[0.98]',
									name: 'hello'
								},
								restProps,
								{
									get ref() {
										return ref;
									},

									set ref($$value) {
										ref = $$value;
										$$settled = false;
									},

									get checked() {
										return checked;
									},

									set checked($$value) {
										checked = $$value;
										$$settled = false;
									},
									children,
									$$slots: { default: true }
								}
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(` `);

					if (Label.Root) {
						$$renderer.push('<!--[-->');

						Label.Root($$renderer, {
							id: 'terms-label',
							for: id,
							class: 'text-sm font-medium leading-none peer-disabled:pointer-events-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(labelText)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div>`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { checked, ref });
	});
}