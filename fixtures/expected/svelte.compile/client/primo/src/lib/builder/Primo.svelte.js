import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="files-mode-banner svelte-1v59ayk" role="status"><strong>Read-only.</strong> <span>Files are authoritative this session — edits made here will be discarded on the next sync. Restart with</span> <code class="svelte-1v59ayk">primo dev --author cms</code> <span>to author from the CMS.</span></div>`);
var root_1 = $.from_html(`<div class="expand svelte-1v59ayk"><!></div>`);
var root_2 = $.from_html(`<span class="grab-handle svelte-1v59ayk"><!></span>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="h-screen flex flex-col"><!> <!> <!></div>`);

export default function Primo($$anchor, $$props) {
	$.push($$props, true);

	const $site_html = () => $.store_get(site_html, '$site_html', $$stores);
	const $mod_key_held = () => $.store_get(mod_key_held, '$mod_key_held', $$stores);
	const $locale = () => $.store_get(locale, '$locale', $$stores);
	const $author_mode = () => $.store_get(author_mode, '$author_mode', $$stores);
	const $onMobile = () => $.store_get(onMobile, '$onMobile', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// Set context so child components can access the site
	const context = $.proxy({ value: $$props.site });

	site_context.set(context);

	$.user_effect(() => {
		context.value = $$props.site;

		if (!$.get(site_data)) return;

		compile_component_head({ html: $$props.site.head, data: $.get(site_data) }).then((generated_code) => {
			$.store_set(site_html, generated_code);
		});
	});

	const user = fromStore(current_user).current;

	if (!user) {
		throw new Error('No current user');
	} else {
		setUserActivity({ user: user.id, site: $$props.site.id });
	}

	let showing_sidebar = $.state(true);

	function reset() {
		$.set(showing_sidebar, true);

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
	$.user_effect(() => {
		$.store_set(mod_key_held, isModKeyPressed(keys));
	});

	let sidebar_pane = $.state(void 0);

	// reset site html to avoid issues when navigating to new site
	onDestroy(() => {
		$.store_set(site_html, null);
	});

	const data = $.derived(() => useContent($$props.site, { target: 'cms' }));
	const site_data = $.derived(() => $.get(data) && ($.get(data)[$locale()] ?? {}));

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
	let last_site_data = $.state(void 0);

	$.user_effect(() => {
		if (!$.get(site_data)) return;

		// Skip recompilation if data is effectively unchanged
		if (_.isEqual($.get(last_site_data), $.get(site_data))) return;

		$.set(last_site_data, _.cloneDeep($.get(site_data)), true);

		compile_component_head({ html: $$props.site.head, data: $.get(site_data) }).then((generated_code) => {
			$.store_set(site_html, generated_code);
		});
	});

	var div = root_4();

	$.event('resize', $.window, reset);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($author_mode() === 'files') $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	Toolbar(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.snippet(node_2, () => $$props.toolbar ?? $.noop);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 2);

	PaneGroup(node_3, {
		direction: 'horizontal',
		autoSaveId: 'page-view',
		style: 'height:initial;flex:1;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node_4 = $.first_child(fragment_1);

			$.bind_this(
				Pane(node_4, {
					defaultSize: 20,
					minSize: 2,
					onResize: (size) => {
						if (size < 10) {
							$.set(showing_sidebar, false);
							$.get(sidebar_pane)?.resize(2);
						} else {
							$.set(showing_sidebar, true);
						}
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_5 = $.first_child(fragment_2);

						{
							var consequent_2 = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_6 = $.first_child(fragment_3);

								{
									var consequent_1 = ($$anchor) => {
										PageType_Sidebar($$anchor, {});
									};

									var alternate = ($$anchor) => {
										Page_Sidebar($$anchor, {});
									};

									$.if(node_6, ($$render) => {
										if (page.params.page_type) $$render(consequent_1); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_3);
							};

							var consequent_3 = ($$anchor) => {
								var div_2 = root_1();
								var node_7 = $.child(div_2);

								IconButton(node_7, {
									onclick: () => {
										reset();
										$.get(sidebar_pane)?.resize(20);
									},
									icon: 'tabler:layout-sidebar-left-expand'
								});

								$.reset(div_2);
								$.append($$anchor, div_2);
							};

							$.if(node_5, ($$render) => {
								if ($.get(showing_sidebar)) $$render(consequent_2); else if (!$onMobile()) $$render(consequent_3, 1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}),
				($$value) => $.set(sidebar_pane, $$value, true),
				() => $.get(sidebar_pane)
			);

			var node_8 = $.sibling(node_4, 2);

			PaneResizer(node_8, {
				class: 'PaneResizer',
				style: 'display: flex;\n			align-items: center;\n			justify-content: center;',
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = $.comment();
					var node_9 = $.first_child(fragment_6);

					{
						var consequent_4 = ($$anchor) => {
							var span = root_2();
							var node_10 = $.child(span);

							Icon(node_10, { icon: 'octicon:grabber-16' });
							$.reset(span);
							$.append($$anchor, span);
						};

						$.if(node_9, ($$render) => {
							if ($.get(showing_sidebar)) $$render(consequent_4);
						});
					}

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_8, 2);

			Pane(node_11, {
				class: 'relative bg-white',
				defaultSize: 80,
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = $.comment();
					var node_12 = $.first_child(fragment_7);

					$.snippet(node_12, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}