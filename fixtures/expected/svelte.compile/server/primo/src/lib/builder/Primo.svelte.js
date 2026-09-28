import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import * as _ from 'lodash-es';
import Icon, { loadIcons } from '@iconify/svelte';
import IconButton from './ui/IconButton.svelte';
import Toolbar from './views/editor/Toolbar.svelte';
import { PressedKeys } from 'runed';
import { isModKeyPressed } from './utils/keyboard';
import { onMobile, mod_key_held, locale } from './stores/app/misc';
import Page_Sidebar from './components/Sidebar/Page_Sidebar.svelte';
import PageType_Sidebar from './components/Sidebar/PageType_Sidebar.svelte';
import { PaneGroup, Pane, PaneResizer } from 'paneforge';
import { site_html } from '$lib/builder/stores/app/page';
import { processCode } from '$lib/builder/utils';
import { page } from '$app/state';
import { site_context } from './stores/context';
import { useContent } from '$lib/Content.svelte';
import { fromStore } from 'svelte/store';
import { current_user } from '$lib/pocketbase/user';
import { author_mode } from '$lib/pocketbase/author_mode';
import { setUserActivity } from '$lib/UserActivity.svelte';

export default function Primo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { site, toolbar, children } = $$props;

		// Set context so child components can access the site
		const context = { value: site };

		site_context.set(context);

		const user = fromStore(current_user).current;

		if (!user) {
			throw new Error('No current user');
		} else {
			setUserActivity({ user: user.id, site: site.id });
		}

		let showing_sidebar = true;

		function reset() {
			showing_sidebar = true;

			// sidebar_pane?.resize(20)
		}

		// Preload icons
		loadIcons([
			'mdi:icon',
			'bxs:duplicate',
			'ic:baseline-edit',
			'ic:baseline-download',
			'ic:outline-delete',
			'bsx:error',
			'mdi:plus',
			'mdi:upload',
			'fa-solid:plus',
			'carbon:close',
			'material-symbols:drag-handle-rounded',
			'ph:caret-down-bold',
			'ph:caret-up-bold',
			'charm:layout-rows',
			'charm:layout-columns',
			'bx:refresh',
			'uil:image-upload',
			'mdi:arrow-up',
			'mdi:arrow-down',
			'ion:trash',
			'akar-icons:plus',
			'akar-icons:check',
			'mdi:chevron-down',
			'ic:round-code',
			'eos-icons:loading',
			'material-symbols:code',
			'fluent:form-multiple-24-regular',
			'gg:website',
			'fluent:library-28-filled',
			'lsicon:marketplace-filled'
		]);

		// Initialize keyboard tracking
		const keys = new PressedKeys();

		// Track Cmd/Ctrl key to show key hint
		let sidebar_pane = void 0;

		// reset site html to avoid issues when navigating to new site
		onDestroy(() => {
			$.store_set(site_html, null);
		});

		const data = $.derived(() => useContent(site, { target: 'cms' }));
		const site_data = $.derived(() => data() && (data()[$.store_get($$store_subs ??= {}, '$locale', locale)] ?? {}));

		async function compile_component_head({ html, data }) {
			const compiled = await processCode({
				component: {
					html: `<svelte:head>${html}</svelte:head>`,
					css: '',
					js: '',
					data: data ?? {}
				}
			});

			if (!compiled.error) {
				return compiled.head;
			} else return '';
		}

		// Generate <head> tag code – only when site data meaningfully changes
		let last_site_data = void 0;

		$$renderer.push(`<div class="h-screen flex flex-col">`);

		if (// Skip recompilation if data is effectively unchanged
		$.store_get($$store_subs ??= {}, '$author_mode', author_mode) === 'files') {
			$$renderer.push(`<!--[0--><div class="files-mode-banner svelte-1v59ayk" role="status"><strong>Read-only.</strong> <span>Files are authoritative this session — edits made here will be discarded on the next sync. Restart with</span> <code class="svelte-1v59ayk">primo dev --author cms</code> <span>to author from the CMS.</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Toolbar($$renderer, {
			children: ($$renderer) => {
				toolbar?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		PaneGroup($$renderer, {
			direction: 'horizontal',
			autoSaveId: 'page-view',
			style: 'height:initial;flex:1;',
			children: ($$renderer) => {
				Pane($$renderer, {
					defaultSize: 20,
					minSize: 2,
					onResize: (size) => {
						if (size < 10) {
							showing_sidebar = false;
							sidebar_pane?.resize(2);
						} else {
							showing_sidebar = true;
						}
					},

					children: ($$renderer) => {
						if (showing_sidebar) {
							$$renderer.push('<!--[0-->');

							if (page.params.page_type) {
								$$renderer.push('<!--[0-->');
								PageType_Sidebar($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
								Page_Sidebar($$renderer, {});
							}

							$$renderer.push(`<!--]-->`);
						} else if (!$.store_get($$store_subs ??= {}, '$onMobile', onMobile)) {
							$$renderer.push(`<!--[1--><div class="expand svelte-1v59ayk">`);

							IconButton($$renderer, {
								onclick: () => {
									reset();
									sidebar_pane?.resize(20);
								},
								icon: 'tabler:layout-sidebar-left-expand'
							});

							$$renderer.push(`<!----></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				PaneResizer($$renderer, {
					class: 'PaneResizer',
					style: 'display: flex;\n			align-items: center;\n			justify-content: center;',
					children: ($$renderer) => {
						if (showing_sidebar) {
							$$renderer.push(`<!--[0--><span class="grab-handle svelte-1v59ayk">`);
							Icon($$renderer, { icon: 'octicon:grabber-16' });
							$$renderer.push(`<!----></span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Pane($$renderer, {
					class: 'relative bg-white',
					defaultSize: 80,
					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}