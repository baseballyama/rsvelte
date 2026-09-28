import * as $ from 'svelte/internal/server';
import SearchIcon from "@lucide/svelte/icons/search";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Search_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<form${$.attributes({ ...restProps })}>`);

		if (Sidebar.Group) {
			$$renderer.push('<!--[-->');

			Sidebar.Group($$renderer, {
				class: 'py-0',
				children: ($$renderer) => {
					if (Sidebar.GroupContent) {
						$$renderer.push('<!--[-->');

						Sidebar.GroupContent($$renderer, {
							class: 'relative',
							children: ($$renderer) => {
								Label($$renderer, {
									for: 'search',
									class: 'sr-only',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Search`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								if (Sidebar.Input) {
									$$renderer.push('<!--[-->');

									Sidebar.Input($$renderer, {
										id: 'search',
										placeholder: 'Search the docs...',
										class: 'ps-8'
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								SearchIcon($$renderer, {
									class: 'pointer-events-none absolute start-2 top-1/2 size-4 -translate-y-1/2 opacity-50 select-none'
								});

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

		$$renderer.push(`</form>`);
		$.bind_props($$props, { ref });
	});
}