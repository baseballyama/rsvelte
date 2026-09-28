import * as $ from 'svelte/internal/server';
import Code from "docs/Code.svelte";

export default function Breakpoints($$renderer) {
	$$renderer.push(`<div><h4 class="pb-8">Breakpoints helper store</h4> <p>Sometimes it's useful to know about your current window breakpoint size to
    order to make any adjustments when browser window gets resized. Smelte comes
    with a helper store just for that.</p> <p>For instance, navigation drawer on this page should hide programmatically
    after hitting small window size breakpoint.</p> `);

	Code($$renderer, {
		code: `
    import breakpoints from "smelte/breakpoints";

    const bp = breakpoints();
    $: show = $bp !== "sm";

    {#if show}
      ...
    {/if}
  `
	});

	$$renderer.push(`<!----> <p><span class="code-inline">breakpoints</span> accepts one function argument which returns breakpoint name. `);

	Code($$renderer, {
		code: `
  function defaultCalc(width) {
    if (width > 1279) {
      return "xl";
    }
    if (width > 1023) {
      return "lg";
    }
    if (width > 767) {
      return "md";
    }
    return "sm";
  }`
	});

	$$renderer.push(`<!----></p></div>`);
}