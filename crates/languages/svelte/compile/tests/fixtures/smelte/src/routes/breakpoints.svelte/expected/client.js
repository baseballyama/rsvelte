import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Code from "docs/Code.svelte";

var root = $.from_html(`<div><h4 class="pb-8">Breakpoints helper store</h4> <p>Sometimes it's useful to know about your current window breakpoint size to
    order to make any adjustments when browser window gets resized. Smelte comes
    with a helper store just for that.</p> <p>For instance, navigation drawer on this page should hide programmatically
    after hitting small window size breakpoint.</p> <!> <p><span class="code-inline">breakpoints</span> accepts one function argument which returns breakpoint name. <!></p></div>`);

export default function Breakpoints($$anchor) {
	var div = root();
	var node = $.sibling($.child(div), 6);

	Code(node, {
		code: `
    import breakpoints from "smelte/breakpoints";

    const bp = breakpoints();
    $: show = $bp !== "sm";

    {#if show}
      ...
    {/if}
  `
	});

	var p = $.sibling(node, 2);
	var node_1 = $.sibling($.child(p), 2);

	Code(node_1, {
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

	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}