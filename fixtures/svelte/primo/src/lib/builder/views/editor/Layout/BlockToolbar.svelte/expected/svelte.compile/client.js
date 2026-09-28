import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';
import { createEventDispatcher } from 'svelte';
import { debugging_context } from '$lib/builder/stores/context';
import { fade } from 'svelte/transition';
import { mod_key_held } from '../../../stores/app/misc';
import { click_to_copy } from '../../../utilities';
import Icon from '@iconify/svelte';
import { current_user } from '$lib/pocketbase/user';
import * as Tooltip from '$lib/components/ui/tooltip';
import { site_context } from '$lib/builder/stores/context';
import { page as pageState } from '$app/state';

var root = $.from_html(`<span class="key-hint svelte-15zkeyd">&#8984; E</span>`);
var root_1 = $.from_html(`<button aria-label="Edit Block Code"><!> <span class="icon svelte-15zkeyd"><!></span></button>`);
var root_2 = $.from_html(`<span class="text-xs font-normal">Edit Content</span>`);
var root_3 = $.from_html(`<button class="block-id svelte-15zkeyd" aria-label="Copy block ID"><!></button>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<!> <button aria-label="Edit Block Content" class="svelte-15zkeyd"><span class="icon"><!></span> <!></button> <!>`, 1);
var root_6 = $.from_html(`<div class="rounded-full p-1"><!></div> <span class="text-xs font-normal"> </span>`, 1);
var root_7 = $.from_html(`<div class="component-button svelte-15zkeyd"><!> <!></div>`);
var root_8 = $.from_html(`Content changes will apply to all <strong> </strong> pages`, 1);
var root_9 = $.from_html(`<div class="component-button svelte-15zkeyd"><!></div>`);
var root_10 = $.from_html(`<button class="svelte-15zkeyd"><!></button>`);
var root_11 = $.from_html(`<div class="top-right svelte-15zkeyd"><button class="button-delete svelte-15zkeyd"><!></button> <!></div>`);
var root_12 = $.from_html(`<button class="bottom-right svelte-15zkeyd"><!></button>`);
var root_13 = $.from_html(`<div class="bottom svelte-15zkeyd"><!></div>`);
var root_14 = $.from_html(`<div class="BlockToolbar primo-reset svelte-15zkeyd"><div class="top svelte-15zkeyd"><!> <!></div> <!></div>`);

export default function BlockToolbar($$anchor, $$props) {
	$.push($$props, true);

	const $current_user = () => $.store_get(current_user, '$current_user', $$stores);
	const $mod_key_held = () => $.store_get(mod_key_held, '$mod_key_held', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const /**
	 * @typedef {Object} Props
	 * @property {any} id
	 * @property {any} i
	 * @property {any} [node]
	 * @property {boolean} [immovable]
	 * @property {null|string} [layout_zone]
	 * @property {boolean} [is_last]
	 * @property {'page' | 'page-type'} [context]
	 * @property {any} [page_type]
	 */
	/** @type {Props} */
	EditingButtons = ($$anchor) => {
		var fragment = root_5();
		var node_1 = $.first_child(fragment);

		{
			var consequent_1 = ($$anchor) => {
				var button = root_1();
				let classes;
				var node_2 = $.child(button);

				{
					var consequent = ($$anchor) => {
						var span = root();

						$.append($$anchor, span);
					};

					$.if(node_2, ($$render) => {
						if ($mod_key_held()) $$render(consequent);
					});
				}

				var span_1 = $.sibling(node_2, 2);
				var node_3 = $.child(span_1);

				Icon(node_3, { icon: 'ph:code-bold' });
				$.reset(span_1);
				$.reset(button);
				$.template_effect(() => classes = $.set_class(button, 1, 'svelte-15zkeyd', null, classes, { showing_key_hint: $mod_key_held() }));

				$.delegated('click', button, () => {
					dispatch('edit-code');
				});

				$.append($$anchor, button);
			};

			$.if(node_1, ($$render) => {
				if ($current_user()?.siteRole === 'developer') $$render(consequent_1);
			});
		}

		var button_1 = $.sibling(node_1, 2);
		var span_2 = $.child(button_1);
		var node_4 = $.child(span_2);

		Icon(node_4, { icon: 'material-symbols:edit-square-outline-rounded' });
		$.reset(span_2);

		var node_5 = $.sibling(span_2, 2);

		{
			var consequent_2 = ($$anchor) => {
				var span_3 = root_2();

				$.append($$anchor, span_3);
			};

			$.if(node_5, ($$render) => {
				if ($current_user()?.siteRole !== 'developer') $$render(consequent_2);
			});
		}

		$.reset(button_1);

		var node_6 = $.sibling(button_1, 2);

		{
			var consequent_3 = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_7 = $.first_child(fragment_1);

				$.component(node_7, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
					Tooltip_Provider($$anchor, {
						delayDuration: 100,
						disableHoverableContent: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_8 = $.first_child(fragment_2);

							$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
								Tooltip_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_4();
										var node_9 = $.first_child(fragment_3);

										$.component(node_9, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
											Tooltip_Trigger($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var button_2 = root_3();
													var node_10 = $.child(button_2);

													Icon(node_10, { icon: 'ph:copy' });
													$.reset(button_2);
													$.action(button_2, ($$node) => click_to_copy?.($$node));
													$.append($$anchor, button_2);
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_9, 2);

										$.component(node_11, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
											Tooltip_Content($$anchor, {
												side: 'bottom',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, `Copy block ID: ${$$props.id ?? ''}`));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			};

			$.if(node_6, ($$render) => {
				if ($current_user()?.siteRole === 'developer' && browser && window.location.hostname === 'localhost') $$render(consequent_3);
			});
		}

		$.delegated('click', button_1, () => dispatch('edit-content'));
		$.append($$anchor, fragment);
	};

	const dispatch = createEventDispatcher();
	const { value: site } = site_context.getOr({ value: null });

	let node = $.prop($$props, 'node', 15),
		layout_zone = $.prop($$props, 'layout_zone', 3, null),
		immovable = $.prop($$props, 'immovable', 3, false),
		is_last = $.prop($$props, 'is_last', 3, false);

	let isFirst = $.derived(() => $$props.i === 0);
	let DEBUGGING = $.state(void 0);

	if (browser) $.set(DEBUGGING, debugging_context.getOr(false), true);

	const base_path = $.proxy(pageState.url.pathname.includes('/sites/') ? `/admin/sites/${site?.id}` : '/admin/site');
	var div = root_14();
	var div_1 = $.child(div);
	var node_12 = $.child(div_1);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_13 = $.first_child(fragment_5);

			$.component(node_13, () => Tooltip.Provider, ($$anchor, Tooltip_Provider_1) => {
				Tooltip_Provider_1($$anchor, {
					delayDuration: 100,
					disableHoverableContent: true,
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = $.comment();
						var node_14 = $.first_child(fragment_6);

						$.component(node_14, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
							Tooltip_Root_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_4();
									var node_15 = $.first_child(fragment_7);

									$.component(node_15, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
										Tooltip_Trigger_1($$anchor, {
											class: 'h-full',
											children: ($$anchor, $$slotProps) => {
												var div_2 = root_7();
												var node_16 = $.child(div_2);

												EditingButtons(node_16);

												var node_17 = $.sibling(node_16, 2);

												$.element(node_17, () => $current_user()?.siteRole === 'developer' ? 'a' : 'div', false, ($$element, $$anchor) => {
													$.attribute_effect(
														$$element,
														() => ({
															href: `${base_path}/page-type--${$$props.page_type.id ?? ''}`,
															class: `${$current_user()?.siteRole === 'developer' ? 'hover:bg-[#292929] hover:color-[#E7E7E7l]' : ''} pointer-events-auto cursor-auto h-full flex items-center gap-2 bg-[var(--primo-color-codeblack)] px-3 py-1 border-l border-[#111] rounded-br-lg`
														}),
														void 0,
														void 0,
														void 0,
														'svelte-15zkeyd'
													);

													var fragment_8 = root_6();
													var div_3 = $.first_child(fragment_8);
													var node_18 = $.child(div_3);

													Icon(node_18, {
														get icon() {
															return $$props.page_type.icon;
														}
													});

													$.reset(div_3);

													var span_4 = $.sibling(div_3, 2);
													var text_1 = $.only_child(span_4, true);

													$.template_effect(() => {
														$.set_style(div_3, `background: ${$$props.page_type.color ?? ''}`);
														$.set_text(text_1, layout_zone() === 'header' ? 'Header' : 'Footer');
													});

													$.append($$anchor, fragment_8);
												});

												$.reset(div_2);
												$.append($$anchor, div_2);
											},
											$$slots: { default: true }
										});
									});

									var node_19 = $.sibling(node_15, 2);

									$.component(node_19, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
										Tooltip_Content_1($$anchor, {
											side: 'bottom',
											align: 'start',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_9 = root_8();
												var strong = $.sibling($.first_child(fragment_9));
												var text_2 = $.only_child(strong, true);

												$.next();
												$.template_effect(() => $.set_text(text_2, $$props.page_type.name));
												$.append($$anchor, fragment_9);
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
			});

			$.append($$anchor, fragment_5);
		};

		var alternate = ($$anchor) => {
			var div_4 = root_9();
			var node_20 = $.child(div_4);

			EditingButtons(node_20);
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_12, ($$render) => {
			if (layout_zone()) $$render(consequent_4); else $$render(alternate, -1);
		});
	}

	var node_21 = $.sibling(node_12, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_5 = root_11();
			var button_3 = $.child(div_5);
			var node_22 = $.child(button_3);

			Icon(node_22, { icon: 'ion:trash' });
			$.reset(button_3);

			var node_23 = $.sibling(button_3, 2);

			{
				var consequent_5 = ($$anchor) => {
					var button_4 = root_10();
					var node_24 = $.child(button_4);

					Icon(node_24, { icon: 'heroicons-outline:chevron-up' });
					$.reset(button_4);
					$.delegated('click', button_4, () => dispatch('moveUp'));
					$.append($$anchor, button_4);
				};

				$.if(node_23, ($$render) => {
					if (!$.get(isFirst)) $$render(consequent_5);
				});
			}

			$.reset(div_5);
			$.delegated('click', button_3, () => dispatch('delete'));
			$.append($$anchor, div_5);
		};

		$.if(node_21, ($$render) => {
			if (!immovable()) $$render(consequent_6);
		});
	}

	$.reset(div_1);

	var node_25 = $.sibling(div_1, 2);

	{
		var consequent_8 = ($$anchor) => {
			var div_6 = root_13();
			var node_26 = $.child(div_6);

			{
				var consequent_7 = ($$anchor) => {
					var button_5 = root_12();
					var node_27 = $.child(button_5);

					Icon(node_27, { icon: 'heroicons-outline:chevron-down' });
					$.reset(button_5);
					$.delegated('click', button_5, () => dispatch('moveDown'));
					$.append($$anchor, button_5);
				};

				$.if(node_26, ($$render) => {
					if (!is_last()) $$render(consequent_7);
				});
			}

			$.reset(div_6);
			$.append($$anchor, div_6);
		};

		$.if(node_25, ($$render) => {
			if (!immovable()) $$render(consequent_8);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => node($$value), () => node());
	$.transition(1, div, () => fade, () => ({ duration: 100 }));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);