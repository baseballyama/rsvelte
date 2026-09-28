import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

const links = ($$anchor, links = $.noop) => {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, links, (link) => link, ($$anchor, link) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			const element = ($$anchor, attributes = $.noop) => {
				var a = root();

				$.attribute_effect(a, () => ({
					...attributes(),
					href: link.href,
					target: '_blank',
					rel: 'noopener noreferrer'
				}));

				var node_2 = $.child(a);

				$.component(node_2, () => Menu.ItemText, ($$anchor, Menu_ItemText) => {
					Menu_ItemText($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, link.title));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				ArrowUpRightIcon(node_3, { class: 'size-4 opacity-60' });
				$.reset(a);
				$.append($$anchor, a);
			};

			$.component(node_1, () => Menu.Item, ($$anchor, Menu_Item) => {
				Menu_Item($$anchor, {
					get value() {
						return link.title;
					},
					element,
					$$slots: { element: true }
				});
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
};

var root = $.from_html(`<a><!> <!></a>`);
var root_1 = $.from_html(`<span>More</span> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Plus($$anchor) {
	const skeletonTools = [
		{
			href: 'https://themes.skeleton.dev/',
			title: 'Theme Generator'
		}
	];

	const communityTools = [
		{ href: 'https://www.etesie.dev/figma', title: 'Figma Kit' },
		{
			href: 'https://www.etesie.dev/guides/figma/01_basics',
			title: 'Figma Kit Tutorials'
		}
	];

	Menu($$anchor, {
		class: 'hidden xl:block',
		positioning: { placement: 'bottom-start' },
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_2();
			var node_4 = $.first_child(fragment_4);

			$.component(node_4, () => Menu.Trigger, ($$anchor, Menu_Trigger) => {
				Menu_Trigger($$anchor, {
					class: 'btn hover:preset-tonal data-[state=open]:preset-tonal',
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_5 = $.sibling($.first_child(fragment_5), 2);

						ChevronDownIcon(node_5, { class: 'size-4 opacity-50' });
						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_4, 2);

			Portal(node_6, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = $.comment();
					var node_7 = $.first_child(fragment_6);

					$.component(node_7, () => Menu.Positioner, ($$anchor, Menu_Positioner) => {
						Menu_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = $.comment();
								var node_8 = $.first_child(fragment_7);

								$.component(node_8, () => Menu.Content, ($$anchor, Menu_Content) => {
									Menu_Content($$anchor, {
										class: 'z-50',
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = root_3();
											var node_9 = $.first_child(fragment_8);

											$.component(node_9, () => Menu.ItemGroup, ($$anchor, Menu_ItemGroup) => {
												Menu_ItemGroup($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_9 = root_2();
														var node_10 = $.first_child(fragment_9);

														$.component(node_10, () => Menu.ItemGroupLabel, ($$anchor, Menu_ItemGroupLabel) => {
															Menu_ItemGroupLabel($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text('Skeleton Tools');

																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														var node_11 = $.sibling(node_10, 2);

														links(node_11, () => skeletonTools);
														$.append($$anchor, fragment_9);
													},
													$$slots: { default: true }
												});
											});

											var node_12 = $.sibling(node_9, 2);

											$.component(node_12, () => Menu.Separator, ($$anchor, Menu_Separator) => {
												Menu_Separator($$anchor, {});
											});

											var node_13 = $.sibling(node_12, 2);

											$.component(node_13, () => Menu.ItemGroup, ($$anchor, Menu_ItemGroup_1) => {
												Menu_ItemGroup_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_10 = root_2();
														var node_14 = $.first_child(fragment_10);

														$.component(node_14, () => Menu.ItemGroupLabel, ($$anchor, Menu_ItemGroupLabel_1) => {
															Menu_ItemGroupLabel_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('Community Tools');

																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});
														});

														var node_15 = $.sibling(node_14, 2);

														links(node_15, () => communityTools);
														$.append($$anchor, fragment_10);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});
}