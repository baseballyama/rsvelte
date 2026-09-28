import * as $ from 'svelte/internal/server';
import Fa from "$lib/fa.svelte";
import { faSeedling } from "@fortawesome/free-solid-svg-icons";
import DocsCode from "../ui/docs-code.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

export default function Power_transforms($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		DocsTitle($$renderer, { title: 'Power Transforms' });
		$$renderer.push(`<!----> `);
		DocsTitle($$renderer, { title: 'Scaling', level: 3 });
		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded">`);
		Fa($$renderer, { icon: faSeedling, size: '4x', style: 'background: mistyrose' });
		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			scale: 0.5,
			size: '4x',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			scale: 1.2,
			size: '4x',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----></div> `);
		DocsCode($$renderer, { code: codes.powerTransforms[0] });
		$$renderer.push(`<!----> `);
		DocsTitle($$renderer, { title: 'Positioning', level: 3 });
		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded">`);

		Fa($$renderer, {
			icon: faSeedling,
			scale: 0.5,
			size: '4x',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			scale: 0.5,
			translateX: 0.2,
			size: '4x',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			scale: 0.5,
			translateX: -0.2,
			size: '4x',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			scale: 0.5,
			translateY: 0.2,
			size: '4x',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			scale: 0.5,
			translateY: -0.2,
			size: '4x',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----></div> `);
		DocsCode($$renderer, { code: codes.powerTransforms[1] });
		$$renderer.push(`<!----> `);
		DocsTitle($$renderer, { title: 'Rotating & Flipping', level: 3 });
		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded">`);

		Fa($$renderer, {
			icon: faSeedling,
			rotate: 90,
			size: '4x',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			rotate: 180,
			size: '4x',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			size: '4x',
			rotate: '270',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			size: '4x',
			rotate: '30',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			size: '4x',
			rotate: '-30',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			size: '4x',
			flip: 'vertical',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			size: '4x',
			flip: 'horizontal',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			size: '4x',
			flip: 'both',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----> `);

		Fa($$renderer, {
			icon: faSeedling,
			size: '4x',
			flip: 'both',
			rotate: '30',
			style: 'background: mistyrose'
		});

		$$renderer.push(`<!----></div> `);
		DocsCode($$renderer, { code: codes.powerTransforms[2] });
		$$renderer.push(`<!---->`);
	});
}