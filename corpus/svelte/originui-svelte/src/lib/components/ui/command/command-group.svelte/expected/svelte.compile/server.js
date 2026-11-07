import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { Command as CommandPrimitive } from 'bits-ui';

export default function Command_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			heading,
			ref = null,
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
						class: cn('**:data-command-group-heading:text-muted-foreground", text-foreground overflow-hidden p-2 **:data-command-group-heading:px-3 **:data-command-group-heading:py-2 **:data-command-group-heading:text-xs **:data-command-group-heading:font-medium', className)
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