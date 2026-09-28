import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="hero-code svelte-fohvgj" aria-hidden="true"><div class="pane pane-md svelte-fohvgj"><div class="pane-bar svelte-fohvgj"><span class="dot svelte-fohvgj"></span> <span class="dot svelte-fohvgj"></span> <span class="dot svelte-fohvgj"></span> <span class="pane-name svelte-fohvgj">+page.md</span></div> <pre class="code svelte-fohvgj"><span class="c-dim svelte-fohvgj">---</span>
<span class="c-key svelte-fohvgj">title</span><span class="c-dim svelte-fohvgj">:</span> <span class="c-str svelte-fohvgj">Hello</span>
<span class="c-dim svelte-fohvgj">---</span>

<span class="c-head svelte-fohvgj"># Hello</span>

<span class="c-tip svelte-fohvgj">:::tip</span>
Svelte in <span class="c-bold svelte-fohvgj">**markdown**</span>
<span class="c-tip svelte-fohvgj">:::</span>

<span class="c-tag svelte-fohvgj">&lt;Counter /&gt;</span></pre></div> <div class="pane pane-render svelte-fohvgj"><div class="pane-bar svelte-fohvgj"><span class="dot svelte-fohvgj"></span> <span class="dot svelte-fohvgj"></span> <span class="dot svelte-fohvgj"></span> <span class="pane-name svelte-fohvgj">localhost:5173</span></div> <div class="render-body svelte-fohvgj"><div class="r-title svelte-fohvgj">Hello</div> <div class="r-line w-9/10 svelte-fohvgj"></div> <div class="r-line w-7/10 svelte-fohvgj"></div> <div class="r-tip svelte-fohvgj"><div class="r-tip-label svelte-fohvgj">TIP</div> <div class="r-line r-tip-line w-8/10 svelte-fohvgj"></div></div> <div class="r-btn svelte-fohvgj">Count: 1</div></div></div></div>`);

export default function HeroCode($$anchor) {
	var div = root();

	$.append($$anchor, div);
}