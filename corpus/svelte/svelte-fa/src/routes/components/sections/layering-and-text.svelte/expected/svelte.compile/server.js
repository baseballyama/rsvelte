import * as $ from 'svelte/internal/server';
import Fa from "$lib/fa.svelte";
import FaLayers from "$lib/fa-layers.svelte";
import FaLayersText from "$lib/fa-layers-text.svelte";

import {
	faBookmark,
	faCalendar,
	faCertificate,
	faCircle,
	faEnvelope,
	faHeart,
	faMoon,
	faPlay,
	faStar,
	faSun,
	faTimes
} from "@fortawesome/free-solid-svg-icons";

import DocsCode from "../ui/docs-code.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

export default function Layering_and_text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		DocsTitle($$renderer, { title: 'Layering & Text' });
		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded">`);

		FaLayers($$renderer, {
			size: '4x',
			style: 'background: mistyrose',
			children: ($$renderer) => {
				Fa($$renderer, { icon: faCircle, color: 'tomato' });
				$$renderer.push(`<!----> `);
				Fa($$renderer, { icon: faTimes, scale: 0.5, color: 'white' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		FaLayers($$renderer, {
			size: '4x',
			style: 'background: mistyrose',
			children: ($$renderer) => {
				Fa($$renderer, { icon: faBookmark });
				$$renderer.push(`<!----> `);
				Fa($$renderer, { icon: faHeart, scale: 0.4, translateY: -0.1, color: 'tomato' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		FaLayers($$renderer, {
			size: '4x',
			style: 'background: mistyrose',
			children: ($$renderer) => {
				Fa($$renderer, { icon: faPlay, scale: 1.2, rotate: -90 });
				$$renderer.push(`<!----> `);
				Fa($$renderer, { icon: faSun, scale: 0.35, translateY: -0.2, color: 'white' });
				$$renderer.push(`<!----> `);

				Fa($$renderer, {
					icon: faMoon,
					scale: 0.3,
					translateX: -0.25,
					translateY: 0.25,
					color: 'white'
				});

				$$renderer.push(`<!----> `);

				Fa($$renderer, {
					icon: faStar,
					scale: 0.3,
					translateX: 0.25,
					translateY: 0.25,
					color: 'white'
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		FaLayers($$renderer, {
			size: '4x',
			style: 'background: mistyrose',
			children: ($$renderer) => {
				Fa($$renderer, { icon: faCalendar });
				$$renderer.push(`<!----> `);

				FaLayersText($$renderer, {
					scale: 0.45,
					translateY: 0.1,
					color: 'white',
					style: 'font-weight: 900',
					children: ($$renderer) => {
						$$renderer.push(`<!---->27`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		FaLayers($$renderer, {
			size: '4x',
			style: 'background: mistyrose',
			children: ($$renderer) => {
				Fa($$renderer, { icon: faCertificate });
				$$renderer.push(`<!----> `);

				FaLayersText($$renderer, {
					scale: 0.25,
					rotate: -30,
					color: 'white',
					style: 'font-weight: 900',
					children: ($$renderer) => {
						$$renderer.push(`<!---->NEW`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		FaLayers($$renderer, {
			size: '4x',
			style: 'background: mistyrose',
			children: ($$renderer) => {
				Fa($$renderer, { icon: faEnvelope });
				$$renderer.push(`<!----> `);

				FaLayersText($$renderer, {
					scale: 0.2,
					translateX: 0.4,
					translateY: -0.4,
					color: 'white',
					style: 'padding: 0 .2em; background: tomato; border-radius: 1em',
					children: ($$renderer) => {
						$$renderer.push(`<!---->1,419`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);
		DocsCode($$renderer, { code: codes.layering[0], lang: 'js' });
		$$renderer.push(`<!----> `);
		DocsCode($$renderer, { code: codes.layering[1] });
		$$renderer.push(`<!---->`);
	});
}