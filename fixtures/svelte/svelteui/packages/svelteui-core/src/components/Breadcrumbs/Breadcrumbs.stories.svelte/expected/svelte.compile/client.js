import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { Breadcrumbs } from './index';
import IconRenderer from '../IconRenderer/IconRenderer.svelte';
import { Home, Person } from 'radix-icons-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Breadcrumbs_stories($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Breadcrumbs',
		get component() {
			return Breadcrumbs;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Breadcrumbs($$anchor, $.spread_props(() => $.get(args), {
					size: 'md',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Breadcrumbs.Item, ($$anchor, Breadcrumbs_Item) => {
							Breadcrumbs_Item($$anchor, {
								href: 'https://svelteui.dev',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Home');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Breadcrumbs.Item, ($$anchor, Breadcrumbs_Item_1) => {
							Breadcrumbs_Item_1($$anchor, {
								active: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Application List');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}));
			}
		}
	});

	var node_4 = $.sibling(node_1, 2);

	Story(node_4, { name: 'Breadcrumbs', id: 'breadcrumbsStory' });

	var node_5 = $.sibling(node_4, 2);

	Story(node_5, {
		name: 'Icon',
		id: 'breadcrumbsIconStory',
		children: ($$anchor, $$slotProps) => {
			Breadcrumbs($$anchor, {
				size: 'md',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_6 = $.first_child(fragment_4);

					$.component(node_6, () => Breadcrumbs.Item, ($$anchor, Breadcrumbs_Item_2) => {
						Breadcrumbs_Item_2($$anchor, {
							href: 'https://svelteui.dev',
							$$slots: {
								icon: ($$anchor, $$slotProps) => {
									IconRenderer($$anchor, {
										slot: 'icon',
										get icon() {
											return Home;
										}
									});
								}
							}
						});
					});

					var node_7 = $.sibling(node_6, 2);

					$.component(node_7, () => Breadcrumbs.Item, ($$anchor, Breadcrumbs_Item_3) => {
						Breadcrumbs_Item_3($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Application List');

								$.append($$anchor, text_2);
							},

							$$slots: {
								default: true,
								icon: ($$anchor, $$slotProps) => {
									IconRenderer($$anchor, {
										slot: 'icon',
										get icon() {
											return Person;
										}
									});
								}
							}
						});
					});

					var node_8 = $.sibling(node_7, 2);

					$.component(node_8, () => Breadcrumbs.Item, ($$anchor, Breadcrumbs_Item_4) => {
						Breadcrumbs_Item_4($$anchor, {
							active: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('View');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_5, 2);

	Story(node_9, {
		name: 'Separator',
		id: 'breadcrumbsSeparatorStory',
		children: ($$anchor, $$slotProps) => {
			Breadcrumbs($$anchor, {
				size: 'md',
				separator: '→',
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root_1();
					var node_10 = $.first_child(fragment_8);

					$.component(node_10, () => Breadcrumbs.Item, ($$anchor, Breadcrumbs_Item_5) => {
						Breadcrumbs_Item_5($$anchor, {
							href: 'https://svelteui.dev',
							$$slots: {
								icon: ($$anchor, $$slotProps) => {
									IconRenderer($$anchor, {
										slot: 'icon',
										get icon() {
											return Home;
										}
									});
								}
							}
						});
					});

					var node_11 = $.sibling(node_10, 2);

					$.component(node_11, () => Breadcrumbs.Item, ($$anchor, Breadcrumbs_Item_6) => {
						Breadcrumbs_Item_6($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Application List');

								$.append($$anchor, text_4);
							},

							$$slots: {
								default: true,
								icon: ($$anchor, $$slotProps) => {
									IconRenderer($$anchor, {
										slot: 'icon',
										get icon() {
											return Person;
										}
									});
								}
							}
						});
					});

					var node_12 = $.sibling(node_11, 2);

					$.component(node_12, () => Breadcrumbs.Item, ($$anchor, Breadcrumbs_Item_7) => {
						Breadcrumbs_Item_7($$anchor, {
							active: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('View');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}