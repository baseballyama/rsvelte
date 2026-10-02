import * as $ from 'svelte/internal/server';
import * as Alert from "$lib/components/ui/alert/index.js";
import { cn } from "$lib/utils/styles.js";

export default function Callout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			type = "note",
			class: className,
			title = type.split("").map((c, i) => i === 0 ? c.toUpperCase() : c).join("")
		} = $$props;

		if (Alert.Root) {
			$$renderer.push('<!--[-->');

			Alert.Root($$renderer, {
				class: cn("mt-6", className),
				variant: type,
				children: ($$renderer) => {
					$$renderer.push(`<span class="dot absolute left-5 top-[25px] inline-block h-[10px] w-[10px] rounded-full"></span> `);

					if (title) {
						$$renderer.push('<!--[0-->');

						if (Alert.Title) {
							$$renderer.push('<!--[-->');

							Alert.Title($$renderer, {
								class: 'mb-2 ml-5 text-[15px] font-semibold',
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
							class: 'leading-relaxed [&>p]:text-[15px] [&>p]:leading-7',
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
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}