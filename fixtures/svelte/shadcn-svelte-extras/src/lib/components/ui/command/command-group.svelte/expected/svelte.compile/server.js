import * as $ from 'svelte/internal/server';
import { Command as CommandPrimitive, useId } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Command_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			heading,
			value,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (CommandPrimitive.Group) {
				$$renderer.push('<!--[-->');

				CommandPrimitive.Group($$renderer, $.spread_props([
					{
						'data-slot': 'command-group',
						class: cn('text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-clip p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium', className),
						value: value ?? heading ?? `----${useId()}`
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

						children: ($$renderer) => {
							if (heading) {
								$$renderer.push('<!--[0-->');

								if (CommandPrimitive.GroupHeading) {
									$$renderer.push('<!--[-->');

									CommandPrimitive.GroupHeading($$renderer, {
										class: 'text-muted-foreground px-2 py-1.5 text-xs font-medium',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(heading)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (CommandPrimitive.GroupItems) {
								$$renderer.push('<!--[-->');
								CommandPrimitive.GroupItems($$renderer, { children });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}