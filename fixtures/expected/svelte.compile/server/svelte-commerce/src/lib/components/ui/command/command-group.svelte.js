import * as $ from 'svelte/internal/server';
import { Command as CommandPrimitive } from 'bits-ui';
import { cn } from '$lib/core/utils';

export default function Command_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			heading,
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
					{ class: cn('overflow-hidden p-1 text-foreground', className) },
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
										class: 'px-2 py-1.5 text-xs font-medium text-muted-foreground',
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