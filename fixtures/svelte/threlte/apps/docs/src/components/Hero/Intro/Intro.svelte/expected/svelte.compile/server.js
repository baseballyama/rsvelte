import * as $ from 'svelte/internal/server';
import { Sequence, createSheetObjectAction } from '@threlte/theatre';
import Button from '$components/Button/Button.svelte';
import FadeOut from '../FadeOut.svelte';
import { springScrollPos } from '../scrollPos';
import TheatreTextBox from './TheatreTextBox.svelte';

export default function Intro($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const sheetObject = createSheetObjectAction();

		Sequence($$renderer, { autoplay: true });
		$$renderer.push(`<!----> `);

		FadeOut($$renderer, {
			progress: $.store_get($$store_subs ??= {}, '$springScrollPos', springScrollPos),
			from: 0.3,
			to: 0.6,
			children: ($$renderer) => {
				$$renderer.push(`<div class="fixed top-0 left-0 mt-[18vh] flex w-screen flex-col items-center justify-center gap-12 px-8 sm:mt-[25vh] md:mt-[30vh] svelte-1el4mnz"${$.attr_style(`transform: translateY(${$.stringify($.store_get($$store_subs ??= {}, '$springScrollPos', springScrollPos) * -50)}px)`)}><div class="svelte-1el4mnz">`);

				TheatreTextBox($$renderer, {
					key: 'mission',
					children: ($$renderer) => {
						$$renderer.push(`<div class="text-faded mb-2 text-center text-xl svelte-1el4mnz">The Mission:</div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				TheatreTextBox($$renderer, {
					key: 'statement',
					children: ($$renderer) => {
						$$renderer.push(`<h1 class="max-w-[450px] text-center text-4xl font-bold text-white/90 svelte-1el4mnz">Rapidly build interactive <span class="relative inline-block svelte-1el4mnz"><div class="bg-orange absolute bottom-0 left-0 -z-10 h-4 w-full origin-left will-change-transform svelte-1el4mnz"></div> 3D apps</span> for the web.</h1>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> `);

				TheatreTextBox($$renderer, {
					key: 'start-building',
					children: ($$renderer) => {
						$$renderer.push(`<div class="flex flex-col-reverse items-center justify-center gap-6 md:flex-row md:gap-3 svelte-1el4mnz"><code class="rounded-xs bg-[#ffffff1a] px-7 py-4 text-sm text-[1em] md:text-base svelte-1el4mnz"><span class="text-orange mr-2 font-bold select-none svelte-1el4mnz">></span>npm i @threlte/core</code> `);

						Button($$renderer, {
							href: `${import.meta.env.BASE_URL}docs/learn/getting-started/introduction`,
							color: 'orange',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Start Building →`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				FadeOut($$renderer, {
					progress: $.store_get($$store_subs ??= {}, '$springScrollPos', springScrollPos),
					from: 0,
					to: 0.2,
					children: ($$renderer) => {
						$$renderer.push(`<div class="will-change-auto svelte-1el4mnz"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="pulse-1 -mb-[20px] svelte-1el4mnz" fill="#fff" viewBox="0 0 256 256"><path d="M212.24,100.24l-80,80a6,6,0,0,1-8.48,0l-80-80a6,6,0,0,1,8.48-8.48L128,167.51l75.76-75.75a6,6,0,0,1,8.48,8.48Z" class="svelte-1el4mnz"></path></svg> <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="pulse-2 -mb-[20px] svelte-1el4mnz" fill="#fff" viewBox="0 0 256 256"><path d="M212.24,100.24l-80,80a6,6,0,0,1-8.48,0l-80-80a6,6,0,0,1,8.48-8.48L128,167.51l75.76-75.75a6,6,0,0,1,8.48,8.48Z" class="svelte-1el4mnz"></path></svg> <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" class="pulse-3 -mb-[20px] svelte-1el4mnz" fill="#fff" viewBox="0 0 256 256"><path d="M212.24,100.24l-80,80a6,6,0,0,1-8.48,0l-80-80a6,6,0,0,1,8.48-8.48L128,167.51l75.76-75.75a6,6,0,0,1,8.48,8.48Z" class="svelte-1el4mnz"></path></svg></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}