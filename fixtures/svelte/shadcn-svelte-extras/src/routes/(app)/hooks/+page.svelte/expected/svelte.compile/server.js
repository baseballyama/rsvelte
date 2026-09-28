import * as $ from 'svelte/internal/server';
import { hooks } from '$content/index.js';
import * as InputGroup from '$lib/components/ui/input-group';
import SearchIcon from '@lucide/svelte/icons/search';
import * as Kbd from '$lib/components/ui/kbd';
import { shortcut } from '$lib/actions/shortcut.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let search = '';
		let searchInput = null;

		const filteredHooks = $.derived(() => {
			return hooks.filter((hook) => {
				return hook.title.toLowerCase().includes(search.toLowerCase());
			});
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-col items-center gap-8"><div class="flex w-full flex-col items-center gap-2 pt-6 pb-3 md:pt-10 md:pb-6 lg:pt-20 lg:pb-10"><h1 class="text-center text-5xl font-medium">Hooks</h1> <p class="text-center text-lg">Browse our library of useful hooks.</p> `);

			if (InputGroup.Root) {
				$$renderer.push('<!--[-->');

				InputGroup.Root($$renderer, {
					class: 'mt-4 w-full max-w-md',
					children: ($$renderer) => {
						if (InputGroup.Input) {
							$$renderer.push('<!--[-->');

							InputGroup.Input($$renderer, {
								placeholder: 'Search hooks...',
								get ref() {
									return searchInput;
								},

								set ref($$value) {
									searchInput = $$value;
									$$settled = false;
								},

								get value() {
									return search;
								},

								set value($$value) {
									search = $$value;
									$$settled = false;
								}
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (InputGroup.Addon) {
							$$renderer.push('<!--[-->');

							InputGroup.Addon($$renderer, {
								children: ($$renderer) => {
									SearchIcon($$renderer, { class: 'size-4 shrink-0 opacity-50' });
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (InputGroup.Addon) {
							$$renderer.push('<!--[-->');

							InputGroup.Addon($$renderer, {
								align: 'inline-end',
								children: ($$renderer) => {
									if (Kbd.Root) {
										$$renderer.push('<!--[-->');

										Kbd.Root($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->/`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <div class="container"><div class="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3"><!--[-->`);

			const each_array = $.ensure_array_like(filteredHooks());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let hook = each_array[$$index];

				$$renderer.push(`<div class="border-border hover:bg-accent relative rounded-lg p-4"><a${$.attr('href', hook.href)} class="flex items-center gap-2 text-lg font-medium"><span class="absolute inset-0"></span> ${$.escape(hook.title)} `);

				if (hook.indicator === 'new') {
					$$renderer.push(`<!--[0--><span class="bg-brand flex size-2 rounded-full" title="New"></span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></a> <p class="text-muted-foreground text-sm">${$.escape(hook.description)}</p></div>`);
			}

			$$renderer.push(`<!--]--></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}