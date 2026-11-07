import * as $ from 'svelte/internal/server';
import AdditionalStyling from "./components/sections/additional-styling.svelte";
import AnimatingIcons from "./components/sections/animating-icons.svelte";
import BasicUse from "./components/sections/basic-use.svelte";
import DuotoneIcons from "./components/sections/duotone-icons.svelte";
import Installation from "./components/sections/installation.svelte";
import LayeringAndText from "./components/sections/layering-and-text.svelte";
import PowerTransforms from "./components/sections/power-transforms.svelte";

export default function Docs($$renderer) {
	$$renderer.push(`<div>`);
	Installation($$renderer, {});
	$$renderer.push(`<!----> `);
	BasicUse($$renderer, {});
	$$renderer.push(`<!----> `);
	AdditionalStyling($$renderer, {});
	$$renderer.push(`<!----> `);
	AnimatingIcons($$renderer, {});
	$$renderer.push(`<!----> `);
	PowerTransforms($$renderer, {});
	$$renderer.push(`<!----> `);
	LayeringAndText($$renderer, {});
	$$renderer.push(`<!----> `);
	DuotoneIcons($$renderer, {});
	$$renderer.push(`<!----></div>`);
}