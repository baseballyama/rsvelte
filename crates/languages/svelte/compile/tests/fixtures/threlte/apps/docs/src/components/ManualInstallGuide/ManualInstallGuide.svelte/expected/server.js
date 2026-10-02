import * as $ from 'svelte/internal/server';
import CopyCodeButton from '../Code/CopyCodeButton.svelte';
import InstallButton from './InstallButton.svelte';
import { onMount } from 'svelte';

export default function ManualInstallGuide($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let useGltf = false;
		let installExtras = false;
		let installRapier = false;
		let installTheatre = false;
		let installXR = false;
		let installFlex = false;
		let installTypes = false;
		let installStudio = false;
		let divider = ' \\';
		let merger = '\n';
		let space = '            ';

		const useDivider = (...args) => {
			return args.some(Boolean) ? divider : '';
		};

		let tag = '';
		let coreDivider = $.derived(() => useDivider(installExtras, useGltf, installRapier, installTheatre, installXR, installFlex, installTypes, installStudio));
		let extrasDivider = $.derived(() => useDivider(installRapier, installTheatre, installXR, installFlex, installTypes, installStudio));
		let rapierDivider = $.derived(() => useDivider(installTheatre, installXR, installFlex, installTypes, installStudio));
		let theatreDivider = $.derived(() => useDivider(installXR, installFlex, installTypes, installStudio));
		let xrDivider = $.derived(() => useDivider(installFlex, installTypes, installStudio));
		let flexDivider = $.derived(() => useDivider(installTypes, installStudio));
		let studioDivider = $.derived(() => useDivider(installTypes));
		let extrasPassivelyActive = $.derived(() => useGltf || installTheatre || installStudio);

		let installCode = $.derived(() => [
			`npm install three @threlte/core${tag}${coreDivider()}`,
			(installExtras || useGltf || installTheatre || installStudio) && `${space}@threlte/extras${tag}${extrasDivider()}`,
			installRapier && `${space}@threlte/rapier${tag} @dimforge/rapier3d-compat${rapierDivider()}`,
			installTheatre && `${space}@threlte/theatre${tag} @theatre/core @theatre/studio${theatreDivider()}`,
			installXR && `${space}@threlte/xr${tag}${xrDivider()}`,
			installFlex && `${space}@threlte/flex${tag}${flexDivider()}`,
			installStudio && `${space}@threlte/studio${tag}${studioDivider()}`,
			installTypes && `${space}@types/three`
		].filter(Boolean).join(merger));

		onMount(() => {
			if (window.navigator.userAgent.includes('Windows')) {
				divider = ' ';
				merger = '';
				space = '';
			}
		});

		$$renderer.push(`<div class="mt-4 grid grid-cols-1 items-start justify-start gap-x-4 gap-y-2 max-md:justify-items-start md:grid-cols-[auto_auto] md:gap-y-2 md:[&amp;>button]:my-1">`);

		InstallButton($$renderer, {
			disabled: true,
			active: true,
			class: 'cursor-not-allowed',
			children: ($$renderer) => {
				$$renderer.push(`<!---->@threlte/core`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p class="my-0 self-center text-sm md:text-base">Simple, transparent Three.js bindings. <code>three</code> is required as a peer dependency.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> `);

		InstallButton($$renderer, {
			onclick: () => {
				installExtras = !installExtras;
			},
			active: installExtras,
			passivelyActive: extrasPassivelyActive(),
			children: ($$renderer) => {
				$$renderer.push(`<!---->@threlte/extras`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p class="my-0 self-center text-sm md:text-base"><a${$.attr('href', `${import.meta.env.BASE_URL}docs/reference/extras/getting-started`)} target="_blank">Components, helpers, hooks</a> and more that add functionality.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> `);

		InstallButton($$renderer, {
			onclick: () => {
				useGltf = !useGltf;
			},
			active: useGltf,
			children: ($$renderer) => {
				$$renderer.push(`<!---->@threlte/gltf`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p class="my-0 self-center text-sm md:text-base">A <a${$.attr('href', `${import.meta.env.BASE_URL}docs/reference/gltf/getting-started`)} target="_blank">command-line tool</a> that turns GLTF assets into declarative and re-usable Threlte components. The generated Threlte components
    need <code>@threlte/extras</code> to work.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> `);

		InstallButton($$renderer, {
			onclick: () => {
				installRapier = !installRapier;
			},
			active: installRapier,
			children: ($$renderer) => {
				$$renderer.push(`<!---->@threlte/rapier`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p class="my-0 self-center text-sm md:text-base">Components and hooks to use the <a href="https://rapier.rs/" target="_blank" rel="noreferrer">Rapier physics engine</a>.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> `);

		InstallButton($$renderer, {
			onclick: () => {
				installTheatre = !installTheatre;
			},
			active: installTheatre,
			children: ($$renderer) => {
				$$renderer.push(`<!---->@threlte/theatre`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p class="my-0 self-center text-sm md:text-base">Components and hooks to use the animation library <a href="https://www.theatrejs.com/" target="_blank" rel="noreferrer">Theatre.js</a>.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> `);

		InstallButton($$renderer, {
			onclick: () => {
				installXR = !installXR;
			},
			active: installXR,
			children: ($$renderer) => {
				$$renderer.push(`<!---->@threlte/xr`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p class="my-0 self-center text-sm md:text-base">Components and hooks for VR and AR.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> `);

		InstallButton($$renderer, {
			onclick: () => {
				installFlex = !installFlex;
			},
			active: installFlex,
			children: ($$renderer) => {
				$$renderer.push(`<!---->@threlte/flex`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p class="my-0 self-center text-sm md:text-base">Components and hooks to use the flex engine <a href="https://yogalayout.com/" target="_blank" rel="noreferrer">Yoga</a>.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> `);

		InstallButton($$renderer, {
			onclick: () => {
				installStudio = !installStudio;
			},
			active: installStudio,
			children: ($$renderer) => {
				$$renderer.push(`<!---->@threlte/studio`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p class="my-0 self-center text-sm md:text-base"><a${$.attr('href', `${import.meta.env.BASE_URL}docs/reference/studio/getting-started`)} target="_blank">Spatial Programming Toolset</a> for Threlte.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> `);

		InstallButton($$renderer, {
			onclick: () => {
				installTypes = !installTypes;
			},
			active: installTypes,
			children: ($$renderer) => {
				$$renderer.push(`<!---->@types/three`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p class="my-0 self-center text-sm md:text-base">TypeScript types for Three.js.</p></div> <p>Install the packages with npm, pnpm, yarn or any other package manager you prefer.</p> <div class="not-content group relative overflow-x-auto rounded-md border border-white/20 bg-blue-900 p-3 text-sm whitespace-pre-wrap shadow-xl *:bg-transparent!"><code class="p-0 text-[1em]">${$.escape(installCode())}</code> `);
		CopyCodeButton($$renderer, { code: installCode() });
		$$renderer.push(`<!----></div>`);
	});
}