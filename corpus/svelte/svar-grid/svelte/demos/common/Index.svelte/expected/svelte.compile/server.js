import * as $ from 'svelte/internal/server';
import { Globals, popupContainer, Button, Segmented } from "@svar-ui/svelte-core";
import Router from "./Router.svelte";
import Link from "./Link.svelte";
import { getLinks } from "./helpers";
import { GitHubLogoIcon, LogoIcon } from "../assets/icons/index";

export default function Index($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { publicName, skins, productTag, productLink } = $$props;
		let skin = skins[0].id;
		let title = "";
		let link = "";
		let show = true;
		let innerWidth = 0;
		const links = getLinks();
		const MOBILE_BREAKPOINT = 767;
		const isMobileView = $.derived(() => innerWidth <= MOBILE_BREAKPOINT);
		const skinSettings = $.derived(() => Object.assign(skinSettings(), (skins.find((a) => a.id === skin) || {}).props));

		function changeSkin({ value }) {
			skin = value;
		}

		function toggleSidebar() {
			show = !show;
		}

		function updateInfo(ev) {
			skin = ev.skin;
			title = ev.title;
			link = ev.link;
		}

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(skins);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let obj = each_array[$$index];

			if (obj.component) {
				$$renderer.push('<!--[-->');
				obj.component($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--> <div${$.attr_class('layout svelte-50cyl5', void 0, { 'active': show, 'narrow': isMobileView() })}><div${$.attr_class('sidebar svelte-50cyl5', void 0, { 'active': show })} role="tabpanel"><div class="sidebar-content svelte-50cyl5"><div class="sidebar-header svelte-50cyl5"><div class="box-title svelte-50cyl5"><a href="https://svar.dev/svelte/" target="_blank" rel="noopener noreferrer" class="svelte-50cyl5"><img${$.attr('src', LogoIcon)} alt="Logo icon" class="box-title-img svelte-50cyl5"/></a> <div class="separator svelte-50cyl5"></div> <a${$.attr('href', `https://svar.dev/svelte/${productLink}/`)} target="_blank" rel="noopener noreferrer" class="svelte-50cyl5"><h1 class="title svelte-50cyl5">Svelte ${$.escape(publicName)}</h1></a></div> <div class="btn-box svelte-50cyl5">`);

		Button($$renderer, {
			type: 'secondary',
			icon: 'wxi-angle-left',
			css: 'toggle-btn',
			onclick: toggleSidebar
		});

		$$renderer.push(`<!----></div></div> <div class="box-links svelte-50cyl5"><!--[-->`);

		const each_array_1 = $.ensure_array_like(links);

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let data = each_array_1[i];

			if (Array.isArray(data)) {
				$$renderer.push('<!--[0-->');
				Link($$renderer, { data, skin, onclick: () => isMobileView() && (show = false) });
			} else {
				$$renderer.push(`<!--[-1--><div class="group-title svelte-50cyl5">${$.escape(data.group)}</div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div></div> <div class="page-content svelte-50cyl5"><div class="page-header svelte-50cyl5">`);

		if (isMobileView()) {
			$$renderer.push(`<!--[0--><div class="header-back-btn svelte-50cyl5"><div class="btn-box svelte-50cyl5">`);

			Button($$renderer, {
				icon: 'wxi-angle-left',
				css: 'toggle-btn',
				onclick: toggleSidebar,
				type: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Back to list`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="page-content-header svelte-50cyl5"><div class="header-title-box svelte-50cyl5">`);

		if (!show && !isMobileView()) {
			$$renderer.push(`<!--[0--><div class="btn-box svelte-50cyl5">`);

			Button($$renderer, {
				type: 'secondary',
				icon: 'wxi-angle-right',
				css: 'toggle-btn',
				onclick: toggleSidebar
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="hint svelte-50cyl5">${$.escape(title)}</div></div> <div class="header-actions-container svelte-50cyl5"><div class="segmented-box svelte-50cyl5">`);

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

				$$renderer.push(` `);

				if (!isMobileView()) {
					$$renderer.push(`<!--[0--><span style="margin-left:4px;" class="svelte-50cyl5">${$.escape(option.label)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
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

		$$renderer.push(`<!----></div> <div class="btn-box svelte-50cyl5"><a${$.attr('href', link)} target="_blank" rel="noopener noreferrer" class="svelte-50cyl5">`);

		Button($$renderer, {
			type: 'secondary',
			css: 'toggle-btn link-btn',
			children: ($$renderer) => {
				$$renderer.push(`<div class="svelte-50cyl5"><img${$.attr('src', GitHubLogoIcon)} alt="GitHub icon" class="svelte-50cyl5"/></div> `);

				if (!isMobileView()) {
					$$renderer.push(`<!--[0--><span class="svelte-50cyl5">See code on GitHub</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></a></div></div></div></div> <div class="wrapper-content svelte-50cyl5" role="none"><div${$.attr_class(`content wx-${$.stringify(skin)}-theme`, 'svelte-50cyl5')} role="none">`);

		Globals($$renderer, {
			children: ($$renderer) => {
				Router($$renderer, { onnewpage: updateInfo, skin, productTag });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></div></div>`);
	});
}