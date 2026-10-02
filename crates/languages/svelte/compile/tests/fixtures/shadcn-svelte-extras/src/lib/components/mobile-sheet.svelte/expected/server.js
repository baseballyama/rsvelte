import * as $ from 'svelte/internal/server';
import * as Sheet from '$lib/components/ui/sheet';
import MenuIcon from '@lucide/svelte/icons/menu';
import XIcon from '@lucide/svelte/icons/x';
import { groupedDocs } from '$lib/features/docs/docs';

export default function Mobile_sheet($$renderer) {
	let open = false;

	const menuRoutes = [
		{ href: '/', title: 'Home' },
		{ href: '/docs', title: 'Docs' },
		{ href: '/components', title: 'Components' },
		{ href: '/hooks', title: 'Hooks' },
		{ href: '/actions', title: 'Actions' }
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Sheet.Root) {
			$$renderer.push('<!--[-->');

			Sheet.Root($$renderer, {
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Sheet.Trigger) {
						$$renderer.push('<!--[-->');

						Sheet.Trigger($$renderer, {
							class: 'flex items-center gap-2 md:hidden',
							children: ($$renderer) => {
								if (open) {
									$$renderer.push('<!--[0-->');
									XIcon($$renderer, { class: 'size-5' });
								} else {
									$$renderer.push('<!--[-1-->');
									MenuIcon($$renderer, { class: 'size-5' });
								}

								$$renderer.push(`<!--]--> Menu`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Sheet.Content) {
						$$renderer.push('<!--[-->');

						Sheet.Content($$renderer, {
							showOverlay: false,
							showCloseButton: false,
							side: 'left',
							class: 'top-(--header-height)! h-[calc(100dvh-var(--header-height))] overflow-y-auto data-[side=left]:w-full',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex flex-col gap-6 px-6 py-6"><div class="flex flex-col gap-2"><h3 class="text-muted-foreground text-xs">Menu</h3> <ul class="flex flex-col gap-2"><!--[-->`);

								const each_array = $.ensure_array_like(menuRoutes);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let route = each_array[$$index];

									$$renderer.push(`<li class="flex flex-col gap-2"><a${$.attr('href', route.href)} class="text-xl">${$.escape(route.title)}</a></li>`);
								}

								$$renderer.push(`<!--]--></ul></div> <!--[-->`);

								const each_array_1 = $.ensure_array_like(Object.entries(groupedDocs));

								for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
									let [groupTitle, routes] = each_array_1[$$index_2];

									$$renderer.push(`<div class="flex flex-col gap-2"><h3 class="text-muted-foreground text-xs">${$.escape(groupTitle)}</h3> <ul class="flex flex-col gap-2"><!--[-->`);

									const each_array_2 = $.ensure_array_like(routes);

									for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
										let route = each_array_2[$$index_1];

										$$renderer.push(`<li class="flex flex-col gap-2"><a${$.attr('href', route.href)} class="text-xl">${$.escape(route.title)}</a></li>`);
									}

									$$renderer.push(`<!--]--></ul></div>`);
								}

								$$renderer.push(`<!--]--></div>`);
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}