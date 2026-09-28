import * as $ from 'svelte/internal/server';
import * as Alert from "$lib/registry/ui/alert/index.js";
import { cn } from "$lib/utils.js";

export default function Callout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			icon: Icon,
			title,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (Alert.Root) {
			$$renderer.push('<!--[-->');

			Alert.Root($$renderer, $.spread_props([
				{
					class: cn("w-auto border bg-background text-foreground md:-mx-1", className)
				},
				restProps,
				{
					children: ($$renderer) => {
						if (Icon) {
							$$renderer.push('<!--[0-->');

							if (Icon) {
								$$renderer.push('<!--[-->');
								Icon($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (title) {
							$$renderer.push('<!--[0-->');

							if (Alert.Title) {
								$$renderer.push('<!--[-->');

								Alert.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(title)}`);
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

						if (Alert.Description) {
							$$renderer.push('<!--[-->');

							Alert.Description($$renderer, {
								class: 'text-card-foreground/80',
								children: ($$renderer) => {
									children?.($$renderer);
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

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
	});
}