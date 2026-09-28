import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComponentCard from '$lib/demo/component-card.svelte';
import { getComponentDialogCtx } from '$lib/demo/component-preview/component-dialog-context.svelte.js';
import ComponentUnavailable from '$lib/demo/component-unavailable.svelte';
import Component from '$lib/demo/component.svelte';
import PageGrid from '$lib/demo/page-grid.svelte';
import PageHeader from '$lib/demo/page-header.svelte';

var root = $.from_html(`<meta name="description"/> <meta property="og:title"/> <meta property="og:description"/> <meta name="twitter:title"/> <meta name="twitter:description"/>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const componentDialogCtx = getComponentDialogCtx();

	async function showComponentModal({ component }) {
		componentDialogCtx.setComponent(component);
	}

	const componentLayoutMeta = $.derived(() => {
		switch ($$props.data.componentsData.meta.directory) {
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

	var fragment_1 = root_1();

	$.head('1i7opib', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);
		var meta_1 = $.sibling(meta, 2);
		var meta_2 = $.sibling(meta_1, 2);
		var meta_3 = $.sibling(meta_2, 2);
		var meta_4 = $.sibling(meta_3, 2);

		$.template_effect(() => {
			$.set_attribute(meta, 'content', $$props.data.SEO.description);
			$.set_attribute(meta_1, 'content', $$props.data.SEO.title);
			$.set_attribute(meta_2, 'content', $$props.data.SEO.description);
			$.set_attribute(meta_3, 'content', $$props.data.SEO.title);
			$.set_attribute(meta_4, 'content', $$props.data.SEO.description);
		});

		$.deferred_template_effect(() => {
			$.document.title = $$props.data.SEO.title ?? '';
		});

		$.append($$anchor, fragment);
	});

	var node = $.first_child(fragment_1);

	PageHeader(node, {
		id: 'title',
		get title() {
			return $$props.data.pageHeader.title;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.data.pageHeader.description));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	PageGrid(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_2 = $.first_child(fragment_3);

			$.each(node_2, 17, () => $$props.data.componentsData.components, ({ Component: RenderedComponent, ...rest }) => rest.id, ($$anchor, $$item) => {
				let RenderedComponent = () => $.get($$item).Component;
				let rest = () => $.exclude_from_object($.get($$item), ['Component']);

				ComponentCard($$anchor, {
					get meta() {
						return $.get(componentLayoutMeta);
					},

					get 'data-component-id'() {
						return rest().id;
					},

					get 'data-component-directory'() {
						return rest().directory;
					},

					get 'data-component-availability'() {
						return rest().availability;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_5 = $.comment();
						var node_3 = $.first_child(fragment_5);

						{
							var consequent = ($$anchor) => {
								ComponentUnavailable($$anchor, {});
							};

							var consequent_1 = ($$anchor) => {
								Component($$anchor, {
									get componentData() {
										return rest();
									},

									onShallowRouteClick: () => {
										if (!RenderedComponent()) return;

										showComponentModal({ component: { ...rest(), Component: RenderedComponent() } });
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_4 = $.first_child(fragment_8);

										$.component(node_4, RenderedComponent, ($$anchor, RenderedComponent_1) => {
											RenderedComponent_1($$anchor, {});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_3, ($$render) => {
								if (rest().availability === 'todo') $$render(consequent); else if (rest().availability === 'available') $$render(consequent_1, 1);
							});
						}

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment_1);
	$.pop();
}