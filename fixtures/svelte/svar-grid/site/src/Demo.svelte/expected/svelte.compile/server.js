import * as $ from 'svelte/internal/server';

import {
	Globals,
	Willow,
	WillowDark,
	Locale,
	popupContainer,
	Button,
	Segmented
} from "@svar-ui/svelte-core";

import Main from "./Main.svelte";
import LogoIcon from "./icons/Logo.svelte";
import WillowDarkIcon from "./icons/WillowDark.svelte";
import WillowIcon from "./icons/Willow.svelte";

export default function Demo($$renderer, $$props) {
	let { productLink, publicName } = $$props;
	let skin = "willow";
	const isStandalone = window.self === window.top;
	const DEMO_SECTION_URL = `https://svar.dev/svelte/${productLink}/`;

	const skins = [
		{
			id: "willow",
			label: "Willow",
			component: Willow,
			icon: WillowIcon
		},

		{
			id: "willow-dark",
			label: "Dark",
			component: WillowDark,
			icon: WillowDarkIcon
		}
	];

	function goBack() {
		window.location.href = DEMO_SECTION_URL;
	}

	function changeSkin({ value }) {
		skin = value;
	}

	Willow($$renderer, {});
	$$renderer.push(`<!----> `);
	WillowDark($$renderer, {});
	$$renderer.push(`<!----> <div${$.attr_class('wx-willow-theme content svelte-11jsci0', void 0, { 'standalone': isStandalone })}>`);

	Locale($$renderer, {
		children: ($$renderer) => {
			Globals($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="header svelte-11jsci0">`);

					if (isStandalone) {
						$$renderer.push(`<!--[0--><div class="header-content svelte-11jsci0"><div class="btn-box svelte-11jsci0">`);

						Button($$renderer, {
							type: 'secondary',
							css: 'btn-back',
							icon: 'wxi-angle-left',
							onclick: goBack,
							children: ($$renderer) => {
								$$renderer.push(`<div class="btn-back-content svelte-11jsci0">`);
								LogoIcon($$renderer, {});
								$$renderer.push(`<!----> <span class="svelte-11jsci0">Go to ${$.escape(publicName)} page</span></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div> <h1 class="svelte-11jsci0">SVAR Svelte ${$.escape(publicName)} - Live Demo</h1></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div class="header-actions svelte-11jsci0"><div class="segmented-box svelte-11jsci0">`);

					{
						function children($$renderer, { option }) {
							const Icon = option.icon;

							if (Icon) {
								$$renderer.push('<!--[-->');
								Icon($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <span class="svelte-11jsci0">${$.escape(option.label)}</span>`);
						}

						Segmented($$renderer, {
							value: skin,
							options: skins,
							css: 'segmented-themes',
							onchange: changeSkin,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!----></div></div></div> <div${$.attr_class(`wx-${$.stringify(skin)}-theme main-content`, 'svelte-11jsci0')}>`);
					Main($$renderer, {});
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}