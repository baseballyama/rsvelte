import * as $ from 'svelte/internal/server';
import Fa from "$lib/fa.svelte";

import {
	faBook,
	faCog,
	faFlag,
	faHome,
	faInfo,
	faPencilAlt,
	faQuoteLeft,
	faQuoteRight
} from "@fortawesome/free-solid-svg-icons";

import DocsCode from "../ui/docs-code.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

export default function Additional_styling($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		DocsTitle($$renderer, { title: 'Additional Styling' });
		$$renderer.push(`<!----> `);
		DocsTitle($$renderer, { title: 'Icon Sizes', level: 3 });
		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded">`);
		Fa($$renderer, { icon: faFlag, size: 'xs' });
		$$renderer.push(`<!----> `);
		Fa($$renderer, { icon: faFlag, size: 'sm' });
		$$renderer.push(`<!----> `);
		Fa($$renderer, { icon: faFlag, size: 'lg' });
		$$renderer.push(`<!----> `);
		Fa($$renderer, { icon: faFlag, size: '2x' });
		$$renderer.push(`<!----> `);
		Fa($$renderer, { icon: faFlag, size: '2.5x' });
		$$renderer.push(`<!----> `);
		Fa($$renderer, { icon: faFlag, size: '5x' });
		$$renderer.push(`<!----> `);
		Fa($$renderer, { icon: faFlag, size: '7x' });
		$$renderer.push(`<!----> `);
		Fa($$renderer, { icon: faFlag, size: '10x' });
		$$renderer.push(`<!----></div> `);
		DocsCode($$renderer, { code: codes.additionalStyling[0] });
		$$renderer.push(`<!----> `);
		DocsTitle($$renderer, { title: 'Fixed Width Icons', level: 3 });
		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded"><div>`);
		Fa($$renderer, { icon: faHome, fw: true, style: 'background: mistyrose' });
		$$renderer.push(`<!----> Home</div> <div>`);
		Fa($$renderer, { icon: faInfo, fw: true, style: 'background: mistyrose' });
		$$renderer.push(`<!----> Info</div> <div>`);
		Fa($$renderer, { icon: faBook, fw: true, style: 'background: mistyrose' });
		$$renderer.push(`<!----> Library</div> <div>`);
		Fa($$renderer, { icon: faPencilAlt, fw: true, style: 'background: mistyrose' });
		$$renderer.push(`<!----> Applications</div> <div>`);
		Fa($$renderer, { icon: faCog, fw: true, style: 'background: mistyrose' });
		$$renderer.push(`<!----> Settings</div></div> `);
		DocsCode($$renderer, { code: codes.additionalStyling[1] });
		$$renderer.push(`<!----> `);
		DocsTitle($$renderer, { title: 'Pulled Icons', level: 3 });
		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded">`);
		Fa($$renderer, { icon: faQuoteLeft, pull: 'left', size: '2x' });
		$$renderer.push(`<!----> `);
		Fa($$renderer, { icon: faQuoteRight, pull: 'right', size: '2x' });

		$$renderer.push(`<!----> Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded
  us then, but that’s no matter — tomorrow we will run faster, stretch our arms further... And one fine
  morning — So we beat on, boats against the current, borne back ceaselessly into the past.</div> `);

		DocsCode($$renderer, { code: codes.additionalStyling[2] });
		$$renderer.push(`<!---->`);
	});
}