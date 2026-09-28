import * as $ from 'svelte/internal/server';
import Fa from "$lib/fa.svelte";
import { faFlag } from "@fortawesome/free-solid-svg-icons";
import DocsCode from "../ui/docs-code.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

export default function Basic_use($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		DocsTitle($$renderer, { title: 'Basic Use' });
		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded">`);
		Fa($$renderer, { icon: faFlag });
		$$renderer.push(`<!----> Flag</div> `);
		DocsCode($$renderer, { code: codes.basicUse[0] });
		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded">Icons import from <a href="https://www.npmjs.com/search?q=%40fortawesome%20svg%20icons" target="_blank">FontAwesome packages</a>, for example: @fortawesome/free-solid-svg-icons. <br/> Icons gallery: <a href="https://fontawesome.com/icons" target="_blank">FontAwesome icons</a></div> <div class="shadow-sm p-3 mb-3 rounded"><div style="font-size: 3em; color: tomato">`);
		Fa($$renderer, { icon: faFlag });
		$$renderer.push(`<!----></div></div> `);
		DocsCode($$renderer, { code: codes.basicUse[1] });
		$$renderer.push(`<!---->`);
	});
}