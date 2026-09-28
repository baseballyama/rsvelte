import * as $ from 'svelte/internal/server';
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

export default function BlockToolbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const dispatch = createEventDispatcher();
		const { value: site } = site_context.getOr({ value: null });

		/**
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
		let {
			id,
			i,
			node = void 0,
			layout_zone = null,
			immovable = false,
			is_last = false,
			page_type
		} = $$props;

		let isFirst = $.derived(() => i === 0);
		let DEBUGGING = void 0;

		if (browser) DEBUGGING = debugging_context.getOr(false);

		const base_path = pageState.url.pathname.includes('/sites/') ? `/admin/sites/${site?.id}` : '/admin/site';

		function EditingButtons($$renderer) {
			if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer') {
				$$renderer.push(`<!--[0--><button aria-label="Edit Block Code"${$.attr_class('svelte-15zkeyd', void 0, {
					'showing_key_hint': $.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)
				})}>`);

				if ($.store_get($$store_subs ??= {}, '$mod_key_held', mod_key_held)) {
					$$renderer.push(`<!--[0--><span class="key-hint svelte-15zkeyd">⌘ E</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <span class="icon svelte-15zkeyd">`);
				Icon($$renderer, { icon: 'ph:code-bold' });
				$$renderer.push(`<!----></span></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <button aria-label="Edit Block Content" class="svelte-15zkeyd"><span class="icon">`);
			Icon($$renderer, { icon: 'material-symbols:edit-square-outline-rounded' });
			$$renderer.push(`<!----></span> `);

			if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole !== 'developer') {
				$$renderer.push(`<!--[0--><span class="text-xs font-normal">Edit Content</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></button> `);

			if ($.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer' && browser && window.location.hostname === 'localhost') {
				$$renderer.push('<!--[0-->');

				if (Tooltip.Provider) {
					$$renderer.push('<!--[-->');

					Tooltip.Provider($$renderer, {
						delayDuration: 100,
						disableHoverableContent: true,
						children: ($$renderer) => {
							if (Tooltip.Root) {
								$$renderer.push('<!--[-->');

								Tooltip.Root($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Trigger) {
											$$renderer.push('<!--[-->');

											Tooltip.Trigger($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<button class="block-id svelte-15zkeyd" aria-label="Copy block ID">`);
													Icon($$renderer, { icon: 'ph:copy' });
													$$renderer.push(`<!----></button>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Content) {
											$$renderer.push('<!--[-->');

											Tooltip.Content($$renderer, {
												side: 'bottom',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Copy block ID: ${$.escape(id)}`);
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
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<div class="BlockToolbar primo-reset svelte-15zkeyd"><div class="top svelte-15zkeyd">`);

		if (layout_zone) {
			$$renderer.push('<!--[0-->');

			if (Tooltip.Provider) {
				$$renderer.push('<!--[-->');

				Tooltip.Provider($$renderer, {
					delayDuration: 100,
					disableHoverableContent: true,
					children: ($$renderer) => {
						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');

							Tooltip.Root($$renderer, {
								children: ($$renderer) => {
									if (Tooltip.Trigger) {
										$$renderer.push('<!--[-->');

										Tooltip.Trigger($$renderer, {
											class: 'h-full',
											children: ($$renderer) => {
												$$renderer.push(`<div class="component-button svelte-15zkeyd">`);
												EditingButtons($$renderer);
												$$renderer.push(`<!----> `);

												$.element(
													$$renderer,
													$.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer' ? 'a' : 'div',
													() => {
														$$renderer.push(`${$.attr('href', `${base_path}/page-type--${$.stringify(page_type.id)}`)}${$.attr_class(`${$.store_get($$store_subs ??= {}, '$current_user', current_user)?.siteRole === 'developer' ? 'hover:bg-[#292929] hover:color-[#E7E7E7l]' : ''} pointer-events-auto cursor-auto h-full flex items-center gap-2 bg-[var(--primo-color-codeblack)] px-3 py-1 border-l border-[#111] rounded-br-lg`, 'svelte-15zkeyd')}`);
													},
													() => {
														$$renderer.push(`<div class="rounded-full p-1"${$.attr_style(`background: ${$.stringify(page_type.color)}`)}>`);
														Icon($$renderer, { icon: page_type.icon });
														$$renderer.push(`<!----></div> <span class="text-xs font-normal">${$.escape(layout_zone === 'header' ? 'Header' : 'Footer')}</span>`);
													}
												);

												$$renderer.push(`</div>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Content) {
										$$renderer.push('<!--[-->');

										Tooltip.Content($$renderer, {
											side: 'bottom',
											align: 'start',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Content changes will apply to all <strong>${$.escape(page_type.name)}</strong> pages`);
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
		} else {
			$$renderer.push(`<!--[-1--><div class="component-button svelte-15zkeyd">`);
			EditingButtons($$renderer);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--> `);

		if (!immovable) {
			$$renderer.push(`<!--[0--><div class="top-right svelte-15zkeyd"><button class="button-delete svelte-15zkeyd">`);
			Icon($$renderer, { icon: 'ion:trash' });
			$$renderer.push(`<!----></button> `);

			if (!isFirst()) {
				$$renderer.push(`<!--[0--><button class="svelte-15zkeyd">`);
				Icon($$renderer, { icon: 'heroicons-outline:chevron-up' });
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (!immovable) {
			$$renderer.push(`<!--[0--><div class="bottom svelte-15zkeyd">`);

			if (!is_last) {
				$$renderer.push(`<!--[0--><button class="bottom-right svelte-15zkeyd">`);
				Icon($$renderer, { icon: 'heroicons-outline:chevron-down' });
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { node });
	});
}