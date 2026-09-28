import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import Inspect, { InspectOptionsProvider } from '$lib/index.js';
import { DEV } from 'esm-env';
import { setContext } from 'svelte';
import { slide } from 'svelte/transition';
import './app.css';
import ExpandRoute from './Expandroute.svelte';
import GlobalOptions from './GlobalOptions.svelte';
import DocSearch from '$doclib/DocSearch.svelte';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<ul class="svelte-8nzpty"></ul>`);
var root_2 = $.from_html(`<li class="svelte-8nzpty"><!></li>`);
var root_3 = $.from_html(`<a> </a>`);
var root_4 = $.from_html(`<li class="svelte-8nzpty"><!> <!></li>`);
var root_5 = $.from_html(`<div class="drawer-content svelte-8nzpty"><nav class="drawer-nav svelte-8nzpty"><ul class="svelte-8nzpty"><li class="svelte-8nzpty"><a style="font-size: 32px; line-height: 1" href="/" class="svelte-8nzpty">Home</a></li> <!></ul></nav> <div style="display: flex; flex-direction: column;gap: 1em"><!> <div class="badges svelte-8nzpty"><a href="https://www.npmjs.com/package/svelte-inspect-value" aria-label="npm" target="_blank" class="svelte-8nzpty"><img alt="npm" src="https://img.shields.io/npm/v/svelte-inspect-value"/></a> <a href="https://github.com/ampled/svelte-inspect-value" class="svelte-8nzpty"><img alt="github" src="https://img.shields.io/github/stars/ampled/svelte-inspect-value?style=social"/></a> <a href="https://ko-fi.com/eirikk" title="support further development" class="svelte-8nzpty"><img alt="kofi" src="https://shields.io/badge/ko--fi-000000?logo=ko-fi&amp;style=for-the-badgeKo-fi"/></a></div></div></div>`);
var root_6 = $.from_html(`<!> <button>reset</button>`, 1);
var root_7 = $.from_html(`<main><header class="svelte-8nzpty"><a href="/" class="title svelte-8nzpty"><h1 aria-label="Svelte Inspect Value" class="header-lib-title svelte-8nzpty">Svelte <code class="svelte-8nzpty">&lt;<span class="inspect svelte-8nzpty">Inspect</span> <span class="value svelte-8nzpty">value</span>} /&gt;</code></h1></a> <!></header> <!></main>`);
var root_8 = $.from_html(`<!> <!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const // {
	//   title: 'Types',
	//   expandable: true,
	//   href: '/docs/types',
	//   children: data.docs
	//     .filter((d) => ['types'].includes(d.type ?? '') && !d.title[1].includes('Custom'))
	//     .map((d) => ({
	//       title: d.title?.[1] ?? '',
	//       href: `/docs/${d.type}/${d.title[1]}`,
	//     })),
	// },
	// {
	//   title: 'Utility',
	//   expandable: true,
	//   href: '/docs/functions',
	//   children: data.docs
	//     .filter((d) => ['functions'].includes(d.type ?? ''))
	//     .map((d) => ({
	//       title: `${d.title?.[1] ?? ''}()`,
	//       href: `/docs/${d.type}/${d.title[1]}`,
	//     })),
	// },
	// {
	//   title: 'Variables',
	//   devonly: true,
	//   expandable: true,
	//   children: data.docs
	//     .filter((d) => ['variables'].includes(d.type ?? ''))
	//     .map((d) => ({
	//       title: d.title?.[1] ?? '',
	//       href: `/docs/${d.type}/${d.title[1]}`,
	//     })),
	// },
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	entry = ($$anchor, route = $.noop) => {
		const active = $.derived(() => page.url.pathname.includes(route().href ?? route().title.toLowerCase()));
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent_4 = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent_1 = ($$anchor) => {
						var li = root_2();
						var node_2 = $.child(li);

						{
							const title = ($$anchor) => {
								var span = root();
								let classes;
								var text = $.only_child(span, true);

								$.template_effect(() => {
									classes = $.set_class(span, 1, 'svelte-8nzpty', null, classes, { active: $.get(active) });
									$.set_text(text, route().title);
								});

								$.append($$anchor, span);
							};

							const subRoutes = ($$anchor, expanded = $.noop) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								{
									var consequent = ($$anchor) => {
										var ul = root_1();

										$.each(ul, 21, () => route().children, (child) => child.title, ($$anchor, child) => {
											entry($$anchor, () => $.get(child));
										});

										$.reset(ul);
										$.transition(3, ul, () => slide);
										$.append($$anchor, ul);
									};

									$.if(node_3, ($$render) => {
										if (route().children && (expanded() || $.get(active))) $$render(consequent);
									});
								}

								$.append($$anchor, fragment_2);
							};

							ExpandRoute(node_2, { title, subRoutes, $$slots: { title: true, subRoutes: true } });
						}

						$.reset(li);
						$.append($$anchor, li);
					};

					var alternate_1 = ($$anchor) => {
						var li_1 = root_4();
						var node_4 = $.child(li_1);

						{
							var consequent_2 = ($$anchor) => {
								var a = root_3();
								let classes_1;
								var text_1 = $.only_child(a, true);

								$.template_effect(() => {
									$.set_attribute(a, 'href', route().href);
									classes_1 = $.set_class(a, 1, 'svelte-8nzpty', null, classes_1, { active: $.get(active) });
									$.set_text(text_1, route().title);
								});

								$.append($$anchor, a);
							};

							var alternate = ($$anchor) => {
								var span_1 = root();
								let classes_2;
								var text_2 = $.only_child(span_1, true);

								$.template_effect(() => {
									classes_2 = $.set_class(span_1, 1, 'svelte-8nzpty', null, classes_2, { active: $.get(active) });
									$.set_text(text_2, route().title);
								});

								$.append($$anchor, span_1);
							};

							$.if(node_4, ($$render) => {
								if (route().href) $$render(consequent_2); else $$render(alternate, -1);
							});
						}

						var node_5 = $.sibling(node_4, 2);

						{
							var consequent_3 = ($$anchor) => {
								var ul_1 = root_1();

								$.each(ul_1, 21, () => route().children, (child) => child.title, ($$anchor, child) => {
									entry($$anchor, () => $.get(child));
								});

								$.reset(ul_1);
								$.append($$anchor, ul_1);
							};

							$.if(node_5, ($$render) => {
								if (route().children) $$render(consequent_3);
							});
						}

						$.reset(li_1);
						$.append($$anchor, li_1);
					};

					$.if(node_1, ($$render) => {
						if (route().expandable) $$render(consequent_1); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if (!route().devonly || route().devonly && DEV && $.get(renderDevOnlyStuff)) $$render(consequent_4);
			});
		}

		$.append($$anchor, fragment);
	};

	let navPanelOpen = $.state(true);
	let renderDevOnlyStuff = $.state(false);

	setContext(Symbol.for('SIV.DEBUG'), () => $.get(renderDevOnlyStuff));

	const routes = $.derived(() => [
		{
			title: 'Reference',
			children: [
				{ title: 'Getting Started', href: '/reference/getting-started' },
				{ href: '/reference/panel', title: 'Panel' },
				{ href: '/reference/values', title: 'Values' },
				{ href: '/reference/examples', title: 'Examples' },
				{ href: '/reference/custom', title: 'Custom components' }
			]
		},

		{
			title: 'Usage',
			children: [
				{ title: 'Hotkeys', href: '/usage/hotkeys' },
				{ title: 'Search', href: '/usage/search' }
			]
		},

		{
			title: 'Theming',
			children: [
				{ title: 'Themes', href: '/theming/themes' },
				{ href: '/theming/define', title: 'Define' },
				{ href: '/theming/vars', title: 'Variables' }
			]
		},

		$$props.data.docs && {
			title: 'TypeDoc',
			children: [
				{
					title: 'Types',
					expandable: true,
					href: '/docs/types',
					children: $$props.data.docs.filter((d) => ['types'].includes(d.type ?? '') && !d.title[1].includes('Custom')).map((d) => ({
						title: d.title?.[1] ?? '',
						href: `/docs/${d.type}/${d.title[1]}`
					}))
				},

				{
					title: 'Utility',
					expandable: true,
					href: '/docs/functions',
					children: $$props.data.docs.filter((d) => ['functions'].includes(d.type ?? '')).map((d) => ({
						title: `${d.title?.[1] ?? ''}()`,
						href: `/docs/${d.type}/${d.title[1]}`
					}))
				},

				{
					title: 'Variables',
					devonly: true,
					expandable: true,
					children: $$props.data.docs.filter((d) => ['variables'].includes(d.type ?? '')).map((d) => ({
						title: d.title?.[1] ?? '',
						href: `/docs/${d.type}/${d.title[1]}`
					}))
				}
			]
		},

		{
			href: '/testing',
			title: 'Testing',
			devonly: true,
			children: [
				{ href: '/testing/alltypes', title: 'All Types', devonly: true },
				{ href: '/testing/global', title: 'Global', devonly: true },
				{ href: '/testing/search', title: 'Search', devonly: true }
			]
		},
		{ href: '/playground', title: 'Playground', devonly: true },
		{ href: '/releases', title: 'Releases', devonly: true }
	].filter(Boolean));

	const INSPECT_OPTIONS_DEFAULT = {
		theme: 'inspect',
		stringCollapse: 0,
		showTools: true,
		showTypes: true,
		showLength: true,
		showPreview: true,
		previewDepth: 1,
		previewEntries: 3,
		flashOnUpdate: true,
		noanimate: false,
		animRate: 1,
		quotes: 'single',
		borderless: false,
		embedMedia: true,
		elementView: 'simple',
		parseJson: false,
		renderIf: true,
		stores: 'full',
		search: false,
		highlightMatches: true,
		heading: false
	};

	let options = $.state($.proxy({
		theme: 'inspect',
		stringCollapse: 0,
		showTools: true,
		showTypes: true,
		showLength: true,
		showPreview: true,
		previewDepth: 1,
		previewEntries: 3,
		flashOnUpdate: true,
		noanimate: false,
		animRate: 1,
		quotes: 'single',
		borderless: false,
		embedMedia: true,
		elementView: 'simple',
		parseJson: false,
		renderIf: true,
		stores: 'full',
		search: false,
		highlightMatches: true,
		heading: false,
		hotkeys: true,
		typeToFocus: true,
		disableKeynav: false
	}));

	function onkeydown(event) {
		if (event.key === 'æ') {
			$.get(options).renderIf = !$.get(options).renderIf;
		}

		if (event.key === 'ø') {
			$.set(renderDevOnlyStuff, !$.get(renderDevOnlyStuff));
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const setOption = (name, value) => {
		$.get(options)[name] = value;
	};

	setContext('set-global-option', setOption);

	let wiggleOnUpdate = true;

	$.event('keydown', $.window, onkeydown);

	InspectOptionsProvider($$anchor, {
		get options() {
			return $.get(options);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_8();
			var node_6 = $.first_child(fragment_6);

			$.component(node_6, () => Inspect.Panel, ($$anchor, Inspect_Panel) => {
				Inspect_Panel($$anchor, {
					style: 'max-width: 230px; min-width: 230px; max-height: 100vh;',
					persist: 'siv.nav-panel',
					align: 'left full',
					hideGlobalValues: true,
					openOnHover: true,
					hideToolbar: true,
					resize: false,
					get open() {
						return $.get(navPanelOpen);
					},

					set open($$value) {
						$.set(navPanelOpen, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var div = root_5();
						var nav = $.child(div);
						var ul_2 = $.child(nav);
						var node_7 = $.sibling($.child(ul_2), 2);

						$.each(node_7, 17, () => $.get(routes), (route) => route.title, ($$anchor, route) => {
							entry($$anchor, () => $.get(route));
						});

						$.reset(ul_2);
						$.reset(nav);

						var div_1 = $.sibling(nav, 2);
						var node_8 = $.child(div_1);

						GlobalOptions(node_8, {
							onreset: () => $.set(options, INSPECT_OPTIONS_DEFAULT, true),
							get options() {
								return $.get(options);
							},

							set options($$value) {
								$.set(options, $$value, true);
							}
						});

						$.next(2);
						$.reset(div_1);
						$.reset(div);
						$.append($$anchor, div);
					},
					$$slots: { default: true }
				});
			});

			var node_9 = $.sibling(node_6, 2);

			{
				let $0 = $.derived(() => DEV && $.get(renderDevOnlyStuff));
				let $1 = $.derived(() => ({ options: $.get(options), page: { ...page } }));

				$.component(node_9, () => Inspect.Panel, ($$anchor, Inspect_Panel_1) => {
					Inspect_Panel_1($$anchor, {
						heading: '+layout.svelte',
						persist: true,
						theme: 'stereo',
						get renderIf() {
							return $.get($0);
						},
						wiggleOnUpdate,
						get values() {
							return $.get($1);
						}
					});
				});
			}

			var node_10 = $.sibling(node_9, 2);

			{
				const failed = ($$anchor, error = $.noop, reset = $.noop) => {
					var fragment_8 = root_6();
					var node_11 = $.first_child(fragment_8);

					Inspect(node_11, {
						get value() {
							return error();
						}
					});

					var button = $.sibling(node_11, 2);

					$.delegated('click', button, function (...$$args) {
						reset()?.apply(this, $$args);
					});

					$.append($$anchor, fragment_8);
				};

				$.boundary(node_10, { failed }, ($$anchor) => {
					var main = root_7();
					let classes_3;
					var header = $.child(main);
					var a_1 = $.child(header);
					var h1 = $.child(a_1);
					var code = $.sibling($.child(h1));
					var text_3 = $.sibling($.child(code), 2);

					text_3.nodeValue = ' {';
					$.next(2);
					$.reset(code);
					$.reset(h1);
					$.reset(a_1);

					var node_12 = $.sibling(a_1, 2);

					DocSearch(node_12, {});
					$.reset(header);

					var node_13 = $.sibling(header, 2);

					$.snippet(node_13, () => $$props.children);
					$.reset(main);
					$.template_effect(() => classes_3 = $.set_class(main, 1, 'svelte-8nzpty', null, classes_3, { 'drawer-open': $.get(navPanelOpen) }));
					$.append($$anchor, main);
				});
			}

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);