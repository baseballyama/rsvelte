import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CopyCodeButton from '../Code/CopyCodeButton.svelte';
import InstallButton from './InstallButton.svelte';
import { onMount } from 'svelte';

var root = $.from_html(
	`<div class="mt-4 grid grid-cols-1 items-start justify-start gap-x-4 gap-y-2 max-md:justify-items-start md:grid-cols-[auto_auto] md:gap-y-2 md:[&amp;>button]:my-1"><!> <p class="my-0 self-center text-sm md:text-base">Simple, transparent Three.js bindings. <code>three</code> is required as a peer dependency.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> <!> <p class="my-0 self-center text-sm md:text-base"><a target="_blank">Components, helpers, hooks</a> and more that add functionality.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> <!> <p class="my-0 self-center text-sm md:text-base">A <a target="_blank">command-line tool</a> that turns GLTF assets into declarative and re-usable Threlte components. The generated Threlte components
    need <code>@threlte/extras</code> to work.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> <!> <p class="my-0 self-center text-sm md:text-base">Components and hooks to use the <a href="https://rapier.rs/" target="_blank" rel="noreferrer">Rapier physics engine</a>.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> <!> <p class="my-0 self-center text-sm md:text-base">Components and hooks to use the animation library <a href="https://www.theatrejs.com/" target="_blank" rel="noreferrer">Theatre.js</a>.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> <!> <p class="my-0 self-center text-sm md:text-base">Components and hooks for VR and AR.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> <!> <p class="my-0 self-center text-sm md:text-base">Components and hooks to use the flex engine <a href="https://yogalayout.com/" target="_blank" rel="noreferrer">Yoga</a>.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> <!> <p class="my-0 self-center text-sm md:text-base"><a target="_blank">Spatial Programming Toolset</a> for Threlte.</p> <hr class="mt-0 border-t border-gray-700 max-md:my-3 md:col-span-2"/> <!> <p class="my-0 self-center text-sm md:text-base">TypeScript types for Three.js.</p></div> <p>Install the packages with npm, pnpm, yarn or any other package manager you prefer.</p> <div class="not-content group relative overflow-x-auto rounded-md border border-white/20 bg-blue-900 p-3 text-sm whitespace-pre-wrap shadow-xl *:bg-transparent!"><code class="p-0 text-[1em]"> </code> <!></div>`,
	1
);

export default function ManualInstallGuide($$anchor, $$props) {
	$.push($$props, true);

	let useGltf = $.state(false);
	let installExtras = $.state(false);
	let installRapier = $.state(false);
	let installTheatre = $.state(false);
	let installXR = $.state(false);
	let installFlex = $.state(false);
	let installTypes = $.state(false);
	let installStudio = $.state(false);
	let divider = ' \\';
	let merger = '\n';
	let space = '            ';

	const useDivider = (...args) => {
		return args.some(Boolean) ? divider : '';
	};

	let tag = '';
	let coreDivider = $.derived(() => useDivider($.get(installExtras), $.get(useGltf), $.get(installRapier), $.get(installTheatre), $.get(installXR), $.get(installFlex), $.get(installTypes), $.get(installStudio)));
	let extrasDivider = $.derived(() => useDivider($.get(installRapier), $.get(installTheatre), $.get(installXR), $.get(installFlex), $.get(installTypes), $.get(installStudio)));
	let rapierDivider = $.derived(() => useDivider($.get(installTheatre), $.get(installXR), $.get(installFlex), $.get(installTypes), $.get(installStudio)));
	let theatreDivider = $.derived(() => useDivider($.get(installXR), $.get(installFlex), $.get(installTypes), $.get(installStudio)));
	let xrDivider = $.derived(() => useDivider($.get(installFlex), $.get(installTypes), $.get(installStudio)));
	let flexDivider = $.derived(() => useDivider($.get(installTypes), $.get(installStudio)));
	let studioDivider = $.derived(() => useDivider($.get(installTypes)));
	let extrasPassivelyActive = $.derived(() => $.get(useGltf) || $.get(installTheatre) || $.get(installStudio));

	let installCode = $.derived(() => [
		`npm install three @threlte/core${tag}${$.get(coreDivider)}`,
		($.get(installExtras) || $.get(useGltf) || $.get(installTheatre) || $.get(installStudio)) && `${space}@threlte/extras${tag}${$.get(extrasDivider)}`,
		$.get(installRapier) && `${space}@threlte/rapier${tag} @dimforge/rapier3d-compat${$.get(rapierDivider)}`,
		$.get(installTheatre) && `${space}@threlte/theatre${tag} @theatre/core @theatre/studio${$.get(theatreDivider)}`,
		$.get(installXR) && `${space}@threlte/xr${tag}${$.get(xrDivider)}`,
		$.get(installFlex) && `${space}@threlte/flex${tag}${$.get(flexDivider)}`,
		$.get(installStudio) && `${space}@threlte/studio${tag}${$.get(studioDivider)}`,
		$.get(installTypes) && `${space}@types/three`
	].filter(Boolean).join(merger));

	onMount(() => {
		if (window.navigator.userAgent.includes('Windows')) {
			divider = ' ';
			merger = '';
			space = '';
		}
	});

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	InstallButton(node, {
		disabled: true,
		active: true,
		class: 'cursor-not-allowed',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('@threlte/core');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 6);

	InstallButton(node_1, {
		onclick: () => {
			$.set(installExtras, !$.get(installExtras));
		},

		get active() {
			return $.get(installExtras);
		},

		get passivelyActive() {
			return $.get(extrasPassivelyActive);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('@threlte/extras');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node_1, 2);
	var a = $.child(p);

	$.next();
	$.reset(p);

	var node_2 = $.sibling(p, 4);

	InstallButton(node_2, {
		onclick: () => {
			$.set(useGltf, !$.get(useGltf));
		},

		get active() {
			return $.get(useGltf);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('@threlte/gltf');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var p_1 = $.sibling(node_2, 2);
	var a_1 = $.sibling($.child(p_1));

	$.next(3);
	$.reset(p_1);

	var node_3 = $.sibling(p_1, 4);

	InstallButton(node_3, {
		onclick: () => {
			$.set(installRapier, !$.get(installRapier));
		},

		get active() {
			return $.get(installRapier);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('@threlte/rapier');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 6);

	InstallButton(node_4, {
		onclick: () => {
			$.set(installTheatre, !$.get(installTheatre));
		},

		get active() {
			return $.get(installTheatre);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('@threlte/theatre');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 6);

	InstallButton(node_5, {
		onclick: () => {
			$.set(installXR, !$.get(installXR));
		},

		get active() {
			return $.get(installXR);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('@threlte/xr');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 6);

	InstallButton(node_6, {
		onclick: () => {
			$.set(installFlex, !$.get(installFlex));
		},

		get active() {
			return $.get(installFlex);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('@threlte/flex');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 6);

	InstallButton(node_7, {
		onclick: () => {
			$.set(installStudio, !$.get(installStudio));
		},

		get active() {
			return $.get(installStudio);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('@threlte/studio');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var p_2 = $.sibling(node_7, 2);
	var a_2 = $.child(p_2);

	$.next();
	$.reset(p_2);

	var node_8 = $.sibling(p_2, 4);

	InstallButton(node_8, {
		onclick: () => {
			$.set(installTypes, !$.get(installTypes));
		},

		get active() {
			return $.get(installTypes);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('@types/three');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);

	var div_1 = $.sibling(div, 4);
	var code = $.child(div_1);
	var text_9 = $.only_child(code, true);
	var node_9 = $.sibling(code, 2);

	CopyCodeButton(node_9, {
		get code() {
			return $.get(installCode);
		}
	});

	$.reset(div_1);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `${import.meta.env.BASE_URL}docs/reference/extras/getting-started`);
		$.set_attribute(a_1, 'href', `${import.meta.env.BASE_URL}docs/reference/gltf/getting-started`);
		$.set_attribute(a_2, 'href', `${import.meta.env.BASE_URL}docs/reference/studio/getting-started`);
		$.set_text(text_9, $.get(installCode));
	});

	$.append($$anchor, fragment);
	$.pop();
}