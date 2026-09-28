import * as $ from 'svelte/internal/server';
import ComponentCard from '$lib/demo/component-card.svelte';
import { getComponentDialogCtx } from '$lib/demo/component-preview/component-dialog-context.svelte.js';
import ComponentUnavailable from '$lib/demo/component-unavailable.svelte';
import Component from '$lib/demo/component.svelte';
import PageGrid from '$lib/demo/page-grid.svelte';
import PageHeader from '$lib/demo/page-header.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const componentDialogCtx = getComponentDialogCtx();

		async function showComponentModal({ component }) {
			componentDialogCtx.setComponent(component);
		}

		const componentLayoutMeta = $.derived(() => {
			switch (data.componentsData.meta.directory) {
				case 'accordions':
					return { layout: 'wide', style: 'default' };

				case 'alerts':
					return { layout: 'wide', style: 'default' };

				case 'avatars':
					return { layout: 'default', style: 'centered' };

				case 'badges':
					return { layout: 'default', style: 'centered' };

				case 'banners':
					return { layout: 'full', style: 'default' };

				case 'breadcrumbs':
					return { layout: 'full', style: 'centered' };

				case 'buttons':
					return { layout: 'default', style: 'centered' };

				case 'checkboxes':
					return { layout: 'default', style: 'default' };

				case 'dialogs':
					return { layout: 'default', style: 'centered' };

				case 'dropdowns':
					return { layout: 'default', style: 'centered' };

				case 'inputs':
					return { layout: 'default', style: 'default' };

				case 'navbars':
					return { layout: 'full', style: 'default' };

				case 'notifications':
					return { layout: 'wide', style: 'centered' };

				case 'paginations':
					return { layout: 'wide', overflow: true, style: 'default' };

				case 'popovers':
					return { layout: 'default', style: 'centered' };

				case 'radios':
					return { layout: 'default', style: 'default' };

				case 'selects':
					return { layout: 'default', style: 'default' };

				case 'sliders':
					return { layout: 'default', style: 'default' };

				case 'switches':
					return { layout: 'default', style: 'centered' };

				case 'tables':
					return { layout: 'full', style: 'default' };

				case 'tabs':
					return { layout: 'wide', style: 'text-center' };

				case 'timelines':
					return { layout: 'wide', style: 'default' };

				case 'tooltips':
					return { layout: 'default', style: 'centered' };

				default:
					return { layout: 'default', style: 'default' };
			}
		});

		$.head('1i7opib', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(data.SEO.title)}</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', data.SEO.description)}/> <meta property="og:title"${$.attr('content', data.SEO.title)}/> <meta property="og:description"${$.attr('content', data.SEO.description)}/> <meta name="twitter:title"${$.attr('content', data.SEO.title)}/> <meta name="twitter:description"${$.attr('content', data.SEO.description)}/>`);
		});

		PageHeader($$renderer, {
			id: 'title',
			title: data.pageHeader.title,
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(data.pageHeader.description)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		PageGrid($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(data.componentsData.components);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { Component: RenderedComponent, ...rest } = each_array[$$index];

					ComponentCard($$renderer, {
						meta: componentLayoutMeta(),
						'data-component-id': rest.id,
						'data-component-directory': rest.directory,
						'data-component-availability': rest.availability,
						children: ($$renderer) => {
							if (rest.availability === 'todo') {
								$$renderer.push('<!--[0-->');
								ComponentUnavailable($$renderer, {});
							} else if (rest.availability === 'available') {
								$$renderer.push('<!--[1-->');

								Component($$renderer, {
									componentData: rest,
									onShallowRouteClick: () => {
										if (!RenderedComponent) return;

										showComponentModal({ component: { ...rest, Component: RenderedComponent } });
									},

									children: ($$renderer) => {
										if (RenderedComponent) {
											$$renderer.push('<!--[-->');
											RenderedComponent($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}