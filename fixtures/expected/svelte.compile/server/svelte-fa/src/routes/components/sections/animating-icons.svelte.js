import * as $ from 'svelte/internal/server';
import Fa from "$lib/fa.svelte";
import { faCircleNotch, faCog, faSpinner, faStroopwafel, faSync } from "@fortawesome/free-solid-svg-icons";
import DocsCode from "../ui/docs-code.svelte";
import DocsTitle from "../ui/docs-title.svelte";
import codes from "./codes.js";

export default function Animating_icons($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		DocsTitle($$renderer, { title: 'Animating Icons' });
		$$renderer.push(`<!----> <div class="shadow-sm p-3 mb-3 rounded">`);
		Fa($$renderer, { icon: faSpinner, size: '3x', spin: true });
		$$renderer.push(`<!----> `);
		Fa($$renderer, { icon: faCircleNotch, size: '3x', spin: true });
		$$renderer.push(`<!----> `);
		Fa($$renderer, { icon: faSync, size: '3x', spin: true });
		$$renderer.push(`<!----> `);
		Fa($$renderer, { icon: faCog, size: '3x', spin: true });
		$$renderer.push(`<!----> `);
		Fa($$renderer, { icon: faSpinner, size: '3x', pulse: true });
		$$renderer.push(`<!----> `);
		Fa($$renderer, { icon: faStroopwafel, size: '3x', spin: true });
		$$renderer.push(`<!----></div> `);
		DocsCode($$renderer, { code: codes.animatingIcons[0] });
		$$renderer.push(`<!---->`);
	});
}