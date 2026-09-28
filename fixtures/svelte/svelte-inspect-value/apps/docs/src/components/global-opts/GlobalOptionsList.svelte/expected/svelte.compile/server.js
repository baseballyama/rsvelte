import * as $ from 'svelte/internal/server';
import { starlightTheme } from './sltheme.svelte.js';
import { DEFAULT_OPTIONS } from 'svelte-inspect-value';
import * as easings from 'svelte/easing';
import { slide } from 'svelte/transition';
import OptionToggle from './OptionToggleCheck.svelte';
import { onMount } from 'svelte';
import { globalOpts, panelState, setGlobalOpts } from './globalopts.svelte';

export function scrollTo(id) {
	if (!panelState.ele) return;

	const wasOpen = panelState.keepOpen;

	panelState.keepOpen = true;

	const input = panelState.ele?.querySelector(id);

	if (!input) return;

	// input.focus()
	input.classList.add('focused');

	input.scrollIntoView({ behavior: 'smooth', block: 'center' });

	setTimeout(
		() => {
			input.classList.remove('focused');
			panelState.keepOpen = wasOpen;
		},
		3000
	);
}

export default function GlobalOptionsList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { visible } = $$props;
		let currentTheme = undefined;
		let bodyEle = void 0;

		onMount(() => {
			const doc = document.documentElement;

			if ('theme' in doc.dataset) {
				starlightTheme.current = doc.dataset['theme'];
			}

			const observer = new MutationObserver((mutations) => {
				mutations.forEach((m) => {
					if (m.type === 'attributes' && m.target instanceof HTMLElement) {
						const dataSet = m.target.dataset;

						if ('theme' in dataSet && currentTheme !== dataSet['theme']) {
							if (dataSet['theme'] === 'dark') {
								globalOpts.theme = 'inspect';
								starlightTheme.current = 'dark';
							} else {
								globalOpts.theme = 'light';
								starlightTheme.current = 'light';
							}

							currentTheme = dataSet['theme'];
						}
					}
				});
			});

			observer.observe(doc, { attributes: true });

			return () => {
				observer.disconnect();
			};
		});

		if (visible) {
			$$renderer.push(`<!--[0--><div id="global-opts"${$.attr_class(
				$.clsx([
					'global-options not-content',
					panelState.keepOpen && 'keep-open'
				]),
				'svelte-14mtmgv'
			)}><div class="options-title svelte-14mtmgv"><div class="tool-buttons svelte-14mtmgv"><button title="Keep Open"${$.attr_class(
				$.clsx([
					'tool-button',
					'pin-button',
					panelState.keepOpen ? 'keep-open' : ''
				]),
				'svelte-14mtmgv'
			)}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" class="svelte-14mtmgv"><path fill="currentColor" d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"></path></svg></button> <button title="Reset Settings" class="tool-button svelte-14mtmgv"><svg style="margin-left: 1px" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M2 12a9 9 0 0 0 9 9c2.39 0 4.68-.94 6.4-2.6l-1.5-1.5A6.7 6.7 0 0 1 11 19c-6.24 0-9.36-7.54-4.95-11.95S18 5.77 18 12h-3l4 4h.1l3.9-4h-3a9 9 0 0 0-18 0"></path></svg></button></div> <span style="text-align: left; width: 100%; margin-left: 1.5rem;">Global Options</span> <a href="/api/type-aliases/inspectoptions" style="text-decoration: none;" class="svelte-14mtmgv">docs</a></div> <div class="go-body svelte-14mtmgv" id="global-opts-body"><label>theme `);

			$$renderer.select(
				{ value: globalOpts.theme, name: 'theme', class: '' },
				($$renderer) => {
					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`inspect`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`drak`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`stereo`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`dark`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`light`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`plain`);
					});
				},
				'svelte-14mtmgv'
			);

			$$renderer.push(`</label> `);

			OptionToggle($$renderer, {
				key: 'borderless',
				children: ($$renderer) => {
					$$renderer.push(`<!---->borderless`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			OptionToggle($$renderer, {
				key: 'parseJson',
				title: 'parse json strings',
				children: ($$renderer) => {
					$$renderer.push(`<!---->parse json`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			OptionToggle($$renderer, {
				key: 'noanimate',
				title: 'disable animation',
				children: ($$renderer) => {
					$$renderer.push(`<!---->noanimate`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			OptionToggle($$renderer, {
				key: 'showTypes',
				title: 'show types',
				children: ($$renderer) => {
					$$renderer.push(`<!---->types`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			OptionToggle($$renderer, {
				key: 'showLength',
				title: 'show lengths / number of entries',
				children: ($$renderer) => {
					$$renderer.push(`<!---->lengths`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			OptionToggle($$renderer, {
				key: 'showTools',
				title: 'show tools on row hover',
				children: ($$renderer) => {
					$$renderer.push(`<!---->tools`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			OptionToggle($$renderer, {
				key: 'showPreview',
				title: 'enable entry previews',
				children: ($$renderer) => {
					$$renderer.push(`<!---->preview`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <label>preview depth <input type="number"${$.attr('value', globalOpts.previewDepth)}${$.attr('disabled', !globalOpts.showPreview, true)} min="0" name="preview-depth" class="svelte-14mtmgv"/></label> <label>preview entries <input type="number"${$.attr('value', globalOpts.previewEntries)}${$.attr('disabled', !globalOpts.showPreview, true)} min="0" name="preview-entries" class="svelte-14mtmgv"/></label> <label title="animation rate">anim rate <input type="number"${$.attr('value', globalOpts.animRate)} min="0.1" max="10"${$.attr('step', 0.1)} name="animation-rate" class="svelte-14mtmgv"/></label> <label title="easing">easing `);

			$$renderer.select(
				{ value: globalOpts.easing, class: '' },
				($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(Object.keys(easings));

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let easing = each_array[$$index];

						$$renderer.option({ value: easings[easing] }, ($$renderer) => {
							$$renderer.push(`${$.escape(easing)}`);
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				'svelte-14mtmgv'
			);

			$$renderer.push(`</label> `);

			OptionToggle($$renderer, {
				key: 'flashOnUpdate',
				title: 'enable node indicators flashing when value is updated',
				children: ($$renderer) => {
					$$renderer.push(`<!---->flash on update`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <label>string quotes `);

			$$renderer.select(
				{ value: globalOpts.quotes, name: 'quotes', class: '' },
				($$renderer) => {
					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`single`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`double`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`none`);
					});
				},
				'svelte-14mtmgv'
			);

			$$renderer.push(`</label> <label>collapse strings <input type="number"${$.attr('value', globalOpts.stringCollapse)} min="0" name="collapse-strings" class="svelte-14mtmgv"/></label> <label>search `);

			$$renderer.select(
				{ value: globalOpts.search, name: 'search', class: '' },
				($$renderer) => {
					$$renderer.option({ value: false }, ($$renderer) => {
						$$renderer.push(`off`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`highlight`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`filter`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`filter-strict`);
					});
				},
				'svelte-14mtmgv'
			);

			$$renderer.push(`</label> `);

			OptionToggle($$renderer, {
				disabled: !globalOpts.search,
				key: 'highlightMatches',
				title: 'highlight matches',
				children: ($$renderer) => {
					$$renderer.push(`<!---->highlight matches`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}