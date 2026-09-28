import * as $ from 'svelte/internal/server';
import { Popover, Tooltip } from '@appwrite.io/pink-svelte';
import { isSmallViewport } from '$lib/stores/viewport';
import { SideSheet } from '$database/(entity)';

export default function Options($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			children,
			tooltipChildren,
			mobileFooterChildren,
			toggleOnTapClick = true,
			onShowStateChanged = null,
			enabled = true,
			onChildrenClick,
			triggerOpen,
			headerTooltipText
		} = $$props;

		let showSheet = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Popover($$renderer, {
				portal: true,
				padding: 'none',
				placement: 'bottom-start',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { toggle, showing }) => {
						$$renderer.push(`<!---->${$.escape(onShowStateChanged?.(showing || showSheet))} `);

						if (toggleOnTapClick && $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
							$$renderer.push(`<!--[0--><button aria-label="Open column review modal">`);
							children($$renderer, () => showSheet = false);
							$$renderer.push(`<!----></button>`);
						} else {
							$$renderer.push(`<!--[-1--><div${$.attr_style('', { display: 'grid' })}>`);

							Tooltip($$renderer, {
								maxWidth: '225px',
								portal: true,
								disabled: !headerTooltipText || showing,
								delay: 100,
								children: ($$renderer) => {
									$$renderer.push(`<button${$.attr_style('', { cursor: enabled ? 'pointer' : undefined })}>`);
									children($$renderer, toggle);
									$$renderer.push(`<!----></button>`);
								},

								$$slots: {
									default: true,
									tooltip: ($$renderer) => {
										{
											$$renderer.push(`${$.escape(headerTooltipText)}`);
										}
									}
								}
							});

							$$renderer.push(`<!----></div>`);
						}

						$$renderer.push(`<!--]-->`);
					},

					tooltip: ($$renderer, { toggle }) => {
						$$renderer.push(`<div slot="tooltip"${$.attr_style('', { width: '480px', padding: '16px' })}>`);
						tooltipChildren($$renderer, toggle);
						$$renderer.push(`<!----></div>`);
					}
				}
			});

			$$renderer.push(`<!----> `);

			if ($.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
				$$renderer.push('<!--[0-->');

				{
					function footer($$renderer) {
						mobileFooterChildren?.($$renderer, () => showSheet = false);
						$$renderer.push(`<!---->`);
					}

					SideSheet($$renderer, {
						title: 'Edit suggested column',
						submit: {
							text: 'Update',
							onClick: () => {
								showSheet = false;
							}
						},

						get show() {
							return showSheet;
						},

						set show($$value) {
							showSheet = $$value;
							$$settled = false;
						},
						footer,
						children: ($$renderer) => {
							tooltipChildren($$renderer, () => showSheet = false);
							$$renderer.push(`<!---->`);
						},
						$$slots: { footer: true, default: true }
					});
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}