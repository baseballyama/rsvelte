import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { IconChevronRight } from '@appwrite.io/pink-icons-svelte';
import { Icon, Layout, Selector, Spinner, Typography } from '@appwrite.io/pink-svelte';
import DirectoryItemSelf from './DirectoryItem.svelte';

export default function DirectoryItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			directories,
			level = 0,
			containerWidth,
			selectedPath,
			onSelect
		} = $$props;

		const Radio = Selector.Radio;
		let radioInputs = [];
		let value = undefined;
		let thumbnailStates = [];

		function handleThumbnailLoad(index) {
			if (!thumbnailStates[index]) return;

			thumbnailStates[index].loading = false;
			thumbnailStates[index].error = false;
		}

		function handleThumbnailError(index) {
			if (!thumbnailStates[index]) return;

			thumbnailStates[index].loading = false;
			thumbnailStates[index].error = true;
		}

		const { elements: { item, group }, helpers: { isExpanded } } = getContext('tree');
		const paddingLeftStyle = `padding-left: ${32 * level + 8}px`;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(directories);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let {
					title,
					fileCount,
					fullPath,
					thumbnailUrl,
					thumbnailIcon,
					thumbnailHtml,
					children,
					hasChildren: explicitHasChildren,
					showThumbnail = true,
					loading = false
				} = each_array[i];

				const hasChildren = explicitHasChildren ?? !!children?.length;
				const __MELTUI_BUILDER_1__ = $.store_get($$store_subs ??= {}, '$group', group)({ id: fullPath });
				const __MELTUI_BUILDER_0__ = $.store_get($$store_subs ??= {}, '$item', item)({ id: fullPath, hasChildren });

				$$renderer.push(`<div class="directory-item-container svelte-1czg5av"><button${$.attributes(
					{
						class: 'folder',
						type: 'button',
						style: paddingLeftStyle,
						...__MELTUI_BUILDER_0__
					},
					'svelte-1czg5av'
				)}>`);

				if (Layout.Stack) {
					$$renderer.push('<!--[-->');

					Layout.Stack($$renderer, {
						direction: 'row',
						justifyContent: 'space-between',
						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									justifyContent: 'flex-start',
									gap: 'xxs',
									alignItems: 'center',
									children: ($$renderer) => {
										$$renderer.push(`<div>`);

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												gap: 'xxs',
												alignItems: 'center',
												children: ($$renderer) => {
													Radio($$renderer, {
														group: 'directory',
														name: 'directory',
														size: 's',
														get value() {
															return value;
														},

														set value($$value) {
															value = $$value;
															$$settled = false;
														},

														get radioInput() {
															return radioInputs[i];
														},

														set radioInput($$value) {
															radioInputs[i] = $$value;
															$$settled = false;
														}
													});

													$$renderer.push(`<!----> <div${$.attr_class('chevron-container svelte-1czg5av', void 0, {
														'folder-open': $.store_get($$store_subs ??= {}, '$isExpanded', isExpanded)(fullPath),
														'disabled': !hasChildren
													})}>`);

													Icon($$renderer, {
														icon: IconChevronRight,
														size: 's',
														color: '--fgcolor-neutral-tertiary'
													});

													$$renderer.push(`<!----></div>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(`</div> <span class="title svelte-1czg5av"${$.attr_style(containerWidth
											? `max-width: ${containerWidth - 100 - level * 40}px`
											: '')}>${$.escape(title)}</span> `);

										if (fileCount !== undefined) {
											$$renderer.push(`<!--[0--><div class="fileCount svelte-1czg5av">`);

											if (Typography.Text) {
												$$renderer.push('<!--[-->');

												Typography.Text($$renderer, {
													variant: 'm-400',
													color: '--fgcolor-neutral-tertiary',
													children: ($$renderer) => {
														$$renderer.push(`<!---->(${$.escape(fileCount)} files)`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</div>`);
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

							$$renderer.push(` `);

							if (showThumbnail) {
								$$renderer.push('<!--[0-->');

								if (loading || thumbnailStates[i]?.loading && !thumbnailIcon && !thumbnailHtml) {
									$$renderer.push('<!--[0-->');
									Spinner($$renderer, {});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (thumbnailStates[i]?.error) {
									$$renderer.push(`<!--[0--><div class="thumbnail-fallback svelte-1czg5av"></div>`);
								} else if (thumbnailUrl) {
									$$renderer.push(`<!--[1--><img${$.attr('src', thumbnailUrl)} alt="Directory thumbnail"${$.attr_class('thumbnail svelte-1czg5av', void 0, { 'hidden': thumbnailStates[i]?.loading })} onload="this.__e=event" onerror="this.__e=event"/>`);
								} else if (thumbnailIcon) {
									$$renderer.push(`<!--[2--><div class="thumbnail svelte-1czg5av">`);
									Icon($$renderer, { icon: thumbnailIcon, size: 'l' });
									$$renderer.push(`<!----></div>`);
								} else if (thumbnailHtml) {
									$$renderer.push(`<!--[3--><div class="thumbnail svelte-1czg5av">${$.html(thumbnailHtml)}</div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
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

				$$renderer.push(`</button> `);

				if (children) {
					$$renderer.push(`<!--[0--><div${$.attributes({ ...__MELTUI_BUILDER_1__ }, 'svelte-1czg5av')}>`);

					DirectoryItemSelf($$renderer, {
						directories: children,
						level: level + 1,
						containerWidth,
						selectedPath,
						onSelect
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
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