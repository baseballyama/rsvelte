import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import GuideContents from './GuideContents.svelte';
import examples from '../_examples.js';
import examplesSsr from '../_examples_ssr.js';

export default function Nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { sections } = $$props;

		// let slug = '';
		let path = void 0;

		// let type;
		// I was getting a weird artifact of a service-worker.js
		// being requested. it's fixed now but keep this for
		// good measure
		let isServiceWorker = $.derived(() => page.url.pathname === '/service-worker.js');

		let segment = '';

		// type = path.split('/')[1];
		// segment = `/${path.replace('/', '').replace(/\$/, '')}`;
		// slug = path.replace(/\/$/, '').split('/').pop();
		// let basePath = '/';
		let open = false;

		let nav = void 0;
		const slimName = /** @param {string} d */ (d) => d.split(' (')[0];

		/** @this {HTMLSelectElement} */
		function loadPage() {
			open = false;
			goto(this.value || '/');
		}

		function toggleOpen() {
			// if the menu is closing, scroll back to the top *after* it
			// shuts. otherwise, scroll back to the top immediately
			// (just in case the user reopened before it happened).
			// The reason we don't just do it when the menu opens is
			// that the scrollbar visibly flashes
			if (open) {
				setTimeout(
					() => {
						if (!open) {
							nav.scrollTop = 0;
						}
					},
					350
				);
			} else {
				nav.scrollTop = 0;
			}

			open = !open;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class(`${open ? 'open' : 'closed'} mousecatcher`, 'svelte-dx5cpj')}></div> <div class="container svelte-dx5cpj"><span${$.attr_class(`menu-link ${open ? 'menu-open' : 'menu-closed'}`, 'svelte-dx5cpj')}>${$.escape(open ? 'Close' : 'Menu')}</span> <a href="/" class="logo svelte-dx5cpj">Layer Cake</a></div> <ul class="dropdown svelte-dx5cpj"><li class="svelte-dx5cpj">`);

			$$renderer.select(
				{ onchange: loadPage, value: segment, class: '' },
				($$renderer) => {
					if (segment.startsWith('/components')) {
						$$renderer.push('<!--[0-->');

						$$renderer.option({ value: segment, disabled: true }, ($$renderer) => {
							$$renderer.push(`Select...`);
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);

					if (segment.startsWith('/guide')) {
						$$renderer.push('<!--[0-->');

						$$renderer.option({ value: segment, disabled: true }, ($$renderer) => {
							$$renderer.push(`Select...`);
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);

					$$renderer.option({ value: '/' }, ($$renderer) => {
						$$renderer.push(`All`);
					});

					$$renderer.option({ class: 'header', disabled: true }, ($$renderer) => {}, 'svelte-dx5cpj');

					$$renderer.option(
						{ class: 'header', disabled: true },
						($$renderer) => {
							$$renderer.push(`Client-side`);
						},
						'svelte-dx5cpj'
					);

					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(examples.slice().sort((a, b) => a.title < b.title ? -1 : 1));

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let example = each_array[$$index];

						$$renderer.option({ value: `/example/${$.stringify(example.slug)}` }, ($$renderer) => {
							$$renderer.push(`${$.escape(slimName(example.title))}`);
						});
					}

					$$renderer.push(`<!--]-->`);
					$$renderer.option({ class: 'header', disabled: true }, ($$renderer) => {}, 'svelte-dx5cpj');

					$$renderer.option(
						{ class: 'header', disabled: true },
						($$renderer) => {
							$$renderer.push(`Server-side`);
						},
						'svelte-dx5cpj'
					);

					$$renderer.push(`<!--[-->`);

					const each_array_1 = $.ensure_array_like(examplesSsr.slice().sort((a, b) => a.title < b.title ? -1 : 1));

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let example = each_array_1[$$index_1];

						$$renderer.option({ value: `/example-ssr/${$.stringify(example.slug)}` }, ($$renderer) => {
							$$renderer.push(`${$.escape(slimName(example.title))}`);
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				'svelte-dx5cpj'
			);

			$$renderer.push(`</li></ul> <nav${$.attr_class($.clsx(open ? 'open' : 'closed'), 'svelte-dx5cpj')}><ul class="primary svelte-dx5cpj"><li class="svelte-dx5cpj"><a${$.attr_class($.clsx(segment === '/components' ? 'active' : ''), 'svelte-dx5cpj')} href="/components"><span class="wide-name svelte-dx5cpj">Component gallery</span><span class="short-name svelte-dx5cpj">Components</span></a></li> <li class="svelte-dx5cpj"><a${$.attr_class($.clsx(segment === '/guide' ? 'active' : ''), 'svelte-dx5cpj')} href="/guide">Guide</a></li> <li class="svelte-dx5cpj"><a id="github-link" target="_blank" rel="noreferrer" href="https://github.com/mhkeller/layercake" aria-label="Layer Cake GitHub Repository" class="svelte-dx5cpj"></a></li></ul> <div class="secondary svelte-dx5cpj">`);

			GuideContents($$renderer, {
				sections,
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></nav>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}