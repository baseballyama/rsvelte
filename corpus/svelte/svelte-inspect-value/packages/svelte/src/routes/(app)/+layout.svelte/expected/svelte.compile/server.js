import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import Inspect, { InspectOptionsProvider } from '$lib/index.js';
import { DEV } from 'esm-env';
import { setContext } from 'svelte';
import { slide } from 'svelte/transition';
import './app.css';
import ExpandRoute from './Expandroute.svelte';
import GlobalOptions from './GlobalOptions.svelte';
import DocSearch from '$doclib/DocSearch.svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let navPanelOpen = true;
		let renderDevOnlyStuff = false;

		setContext(Symbol.for('SIV.DEBUG'), () => renderDevOnlyStuff);

		const { children, data } = $$props;

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

			data.docs && {
				title: 'TypeDoc',
				children: [
					{
						title: 'Types',
						expandable: true,
						href: '/docs/types',
						children: data.docs.filter((d) => ['types'].includes(d.type ?? '') && !d.title[1].includes('Custom')).map((d) => ({
							title: d.title?.[1] ?? '',
							href: `/docs/${d.type}/${d.title[1]}`
						}))
					},

					{
						title: 'Utility',
						expandable: true,
						href: '/docs/functions',
						children: data.docs.filter((d) => ['functions'].includes(d.type ?? '')).map((d) => ({
							title: `${d.title?.[1] ?? ''}()`,
							href: `/docs/${d.type}/${d.title[1]}`
						}))
					},

					{
						title: 'Variables',
						devonly: true,
						expandable: true,
						children: data.docs.filter((d) => ['variables'].includes(d.type ?? '')).map((d) => ({
							title: d.title?.[1] ?? '',
							href: `/docs/${d.type}/${d.title[1]}`
						}))
					}
				]
			},

			// {
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

		let options = {
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
		};

		function onkeydown(event) {
			if (event.key === 'æ') {
				options.renderIf = !options.renderIf;
			}

			if (event.key === 'ø') {
				renderDevOnlyStuff = !renderDevOnlyStuff;
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const setOption = (name, value) => {
			options[name] = value;
		};

		setContext('set-global-option', setOption);

		let wiggleOnUpdate = true;

		function entry($$renderer, route) {
			const active = page.url.pathname.includes(route.href ?? route.title.toLowerCase());

			if (!route.devonly || route.devonly && DEV && renderDevOnlyStuff) {
				$$renderer.push('<!--[0-->');

				if (route.expandable) {
					$$renderer.push(`<!--[0--><li class="svelte-8nzpty">`);

					{
						function title($$renderer) {
							$$renderer.push(`<span${$.attr_class('svelte-8nzpty', void 0, { 'active': active })}>${$.escape(route.title)}</span>`);
						}

						function subRoutes($$renderer, expanded) {
							if (route.children && (expanded || active)) {
								$$renderer.push(`<!--[0--><ul class="svelte-8nzpty"><!--[-->`);

								const each_array = $.ensure_array_like(route.children);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let child = each_array[$$index];

									entry($$renderer, child);
								}

								$$renderer.push(`<!--]--></ul>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						ExpandRoute($$renderer, { title, subRoutes, $$slots: { title: true, subRoutes: true } });
					}

					$$renderer.push(`<!----></li>`);
				} else {
					$$renderer.push(`<!--[-1--><li class="svelte-8nzpty">`);

					if (route.href) {
						$$renderer.push(`<!--[0--><a${$.attr('href', route.href)}${$.attr_class('svelte-8nzpty', void 0, { 'active': active })}>${$.escape(route.title)}</a>`);
					} else {
						$$renderer.push(`<!--[-1--><span${$.attr_class('svelte-8nzpty', void 0, { 'active': active })}>${$.escape(route.title)}</span>`);
					}

					$$renderer.push(`<!--]--> `);

					if (route.children) {
						$$renderer.push(`<!--[0--><ul class="svelte-8nzpty"><!--[-->`);

						const each_array_1 = $.ensure_array_like(route.children);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let child = each_array_1[$$index_1];

							entry($$renderer, child);
						}

						$$renderer.push(`<!--]--></ul>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></li>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			InspectOptionsProvider($$renderer, {
				options,
				children: ($$renderer) => {
					if (Inspect.Panel) {
						$$renderer.push('<!--[-->');

						Inspect.Panel($$renderer, {
							style: 'max-width: 230px; min-width: 230px; max-height: 100vh;',
							persist: 'siv.nav-panel',
							align: 'left full',
							hideGlobalValues: true,
							openOnHover: true,
							hideToolbar: true,
							resize: false,
							get open() {
								return navPanelOpen;
							},

							set open($$value) {
								navPanelOpen = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								$$renderer.push(`<div class="drawer-content svelte-8nzpty"><nav class="drawer-nav svelte-8nzpty"><ul class="svelte-8nzpty"><li class="svelte-8nzpty"><a style="font-size: 32px; line-height: 1" href="/" class="svelte-8nzpty">Home</a></li> <!--[-->`);

								const each_array_2 = $.ensure_array_like(routes());

								for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
									let route = each_array_2[$$index_2];

									entry($$renderer, route);
								}

								$$renderer.push(`<!--]--></ul></nav> <div style="display: flex; flex-direction: column;gap: 1em">`);

								GlobalOptions($$renderer, {
									onreset: () => options = INSPECT_OPTIONS_DEFAULT,
									get options() {
										return options;
									},

									set options($$value) {
										options = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----> <div class="badges svelte-8nzpty"><a href="https://www.npmjs.com/package/svelte-inspect-value" aria-label="npm" target="_blank" class="svelte-8nzpty"><img alt="npm" src="https://img.shields.io/npm/v/svelte-inspect-value"/></a> <a href="https://github.com/ampled/svelte-inspect-value" class="svelte-8nzpty"><img alt="github" src="https://img.shields.io/github/stars/ampled/svelte-inspect-value?style=social"/></a> <a href="https://ko-fi.com/eirikk" title="support further development" class="svelte-8nzpty"><img alt="kofi" src="https://shields.io/badge/ko--fi-000000?logo=ko-fi&amp;style=for-the-badgeKo-fi"/></a></div></div></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Inspect.Panel) {
						$$renderer.push('<!--[-->');

						Inspect.Panel($$renderer, {
							heading: '+layout.svelte',
							persist: true,
							theme: 'stereo',
							renderIf: DEV && renderDevOnlyStuff,
							wiggleOnUpdate,
							values: { options, page: { ...page } }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					{
						function failed($$renderer, error, reset) {
							Inspect($$renderer, { value: error });
							$$renderer.push(`<!----> <button>reset</button>`);
						}

						$$renderer.boundary({ failed }, ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							{
								$$renderer.push(`<main${$.attr_class('svelte-8nzpty', void 0, { 'drawer-open': navPanelOpen })}><header class="svelte-8nzpty"><a href="/" class="title svelte-8nzpty"><h1 aria-label="Svelte Inspect Value" class="header-lib-title svelte-8nzpty">Svelte <code class="svelte-8nzpty">&lt;<span class="inspect svelte-8nzpty">Inspect</span> {<span class="value svelte-8nzpty">value</span>} /></code></h1></a> `);
								DocSearch($$renderer, {});
								$$renderer.push(`<!----></header> `);
								children($$renderer);
								$$renderer.push(`<!----></main>`);
							}

							$$renderer.push(`<!--]-->`);
						});
					}
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}