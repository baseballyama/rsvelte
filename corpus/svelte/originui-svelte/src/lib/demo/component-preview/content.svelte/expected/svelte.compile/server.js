import * as $ from 'svelte/internal/server';
import CodePreview from '../code-preview.svelte';
import ComponentDependency from '../component-dependency.svelte';
import GotoComponentButton from '../component-goto-button.svelte';
import CopyButton from '../copy-button.svelte';
import ShareButton from '../share-button.svelte';
import Box from '@lucide/svelte/icons/box';
import Code from '@lucide/svelte/icons/code';
import Folder from '@lucide/svelte/icons/folder';
import FolderTree from '@lucide/svelte/icons/folder-tree';
import { page } from '$app/state';
import * as Tab from '$lib/components/ui/tabs';
import { tick } from 'svelte';

export default function Content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			component,
			isSinglePage = false,
			onGotoComponent,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let dialogRef = null;
		let wrapperRef = null;

		const handleTabChange = () => {
			tick().then(() => {});
		};

		$$renderer.push(`<div${$.attributes({ class: 'flex flex-col gap-4 px-4 pb-4', ...restProps })}><div class="space-y-2"><div class="flex items-center gap-2"><h2 class="text-2xl font-bold">${$.escape(component.name)}</h2> `);
		ShareButton($$renderer, { component });
		$$renderer.push(`<!----> `);

		if (!isSinglePage) {
			$$renderer.push('<!--[0-->');

			GotoComponentButton($$renderer, {
				description: `Go to the ${$.stringify(component.name)} component`,
				href: `${$.stringify(page.url.href)}/${$.stringify(component.id)}`,
				onclick: onGotoComponent
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="flex flex-col gap-1"><div class="text-muted-foreground text-sm">`);
		Folder($$renderer, { class: 'inline-block', size: 16, 'aria-hidden': 'true' });
		$$renderer.push(`<!----> <span>Directory:</span> <span>${$.escape(component.directory)}</span></div> <div class="text-muted-foreground text-sm">`);
		FolderTree($$renderer, { class: 'inline-block', size: 16, 'aria-hidden': 'true' });
		$$renderer.push(`<!----> <span>Path:</span> <span>${$.escape(component.path)}</span></div></div></div> `);

		if (isSinglePage) {
			$$renderer.push(`<!--[0--><div class="bg-background flex scale-90 flex-col items-center gap-4 rounded-lg border p-6">`);

			if (component.Component) {
				$$renderer.push('<!--[-->');
				component.Component($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="flex flex-col gap-4">`);

		if (Tab.Tabs) {
			$$renderer.push('<!--[-->');

			Tab.Tabs($$renderer, {
				value: 'code',
				onValueChange: handleTabChange,
				children: ($$renderer) => {
					if (Tab.TabsList) {
						$$renderer.push('<!--[-->');

						Tab.TabsList($$renderer, {
							children: ($$renderer) => {
								if (Tab.TabsTrigger) {
									$$renderer.push('<!--[-->');

									Tab.TabsTrigger($$renderer, {
										value: 'code',
										children: ($$renderer) => {
											Code($$renderer, {
												class: '-ms-0.5 me-1.5 opacity-60',
												size: 16,
												'aria-hidden': 'true'
											});

											$$renderer.push(`<!----> Code`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (component.componentDependencies.list.length > 0) {
									$$renderer.push('<!--[0-->');

									if (Tab.TabsTrigger) {
										$$renderer.push('<!--[-->');

										Tab.TabsTrigger($$renderer, {
											value: 'dependencies',
											children: ($$renderer) => {
												Box($$renderer, {
													class: '-ms-0.5 me-1.5 opacity-60',
													size: 16,
													'aria-hidden': 'true'
												});

												$$renderer.push(`<!----> Dependencies`);
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

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <div class="overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.4,_0,_0.2,_1)]"><div>`);

					if (Tab.TabsContent) {
						$$renderer.push('<!--[-->');

						Tab.TabsContent($$renderer, {
							value: 'code',
							class: 'relative pt-4',
							children: ($$renderer) => {
								CopyButton($$renderer, {
									class: 'absolute top-4 right-2',
									code: component.code.raw.content
								});

								$$renderer.push(`<!----> `);

								CodePreview($$renderer, {
									class: 'bg-muted overflow-y-auto rounded-lg py-4 [&_pre]:data-[component=false]:max-h-[440px] [&_pre]:data-[component=true]:max-h-[calc(100svh-25rem)]',
									code: component.code.highlighted.content,
									'data-component': isSinglePage ? true : false
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

					$$renderer.push(` `);

					if (component.componentDependencies.list.length > 0) {
						$$renderer.push('<!--[0-->');

						if (Tab.TabsContent) {
							$$renderer.push('<!--[-->');

							Tab.TabsContent($$renderer, {
								value: 'dependencies',
								children: ($$renderer) => {
									$$renderer.push(`<div class="grid grid-cols-2 gap-4 pt-4"><!--[-->`);

									const each_array = $.ensure_array_like(component.componentDependencies.list);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let dependency = each_array[$$index];

										ComponentDependency($$renderer, { dependency });
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
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div></div>`);
	});
}