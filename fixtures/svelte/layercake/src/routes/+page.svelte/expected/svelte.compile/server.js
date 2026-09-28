import * as $ from 'svelte/internal/server';
import hljs from 'highlight.js';
import examples from './_examples.js';
import examplesSsr from './_examples_ssr.js';
import hljsDefineSvelte from '../_modules/hljsDefineSvelte.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		hljs.registerLanguage('svelte', hljsDefineSvelte);
		hljsDefineSvelte(hljs);

		const codeExample = `<scr${''}ipt>
	// The library provides a main wrapper component
	// and a bunch empty layout components...
	import { LayerCake, Svg, Html, Canvas } from 'layercake';

	// ...that you fill with your own chart components,
	// that live inside your project and which you
	// can copy and paste from here as starting points.
	im${''}port AxisX f${''}rom './components/AxisX.svelte';
  im${''}port AxisY f${''}rom './components/AxisY.svelte';
  im${''}port Line f${''}rom './components/Line.svelte';
  im${''}port Scatter f${''}rom './components/Scatter.svelte';
  im${''}port Labels f${''}rom './components/Labels.svelte';

	const data = [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 3 }];
</scr${''}ipt>

<sty${''}le>
	.chart-container {
		width: 100%;
		height: 500px;
	}
</sty${''}le>

<div class="chart-container">
	<LayerCake
		x='x'
		y='y'
		{data}
	>
		<Svg>
			<AxisX/>
			<AxisY/>
			<Line color='#f0c'/>
		</Svg>

		<Canvas>
			<Scatter color='#0fc'/>
		</Canvas>

		<Html>
			<Labels/>
		</Html>
	</LayerCake>
</div>`.trim().replace(/\t/g, '  ');

		$.head('1uha8ag', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Layer Cake</title>`);
			});

			$$renderer.push(`<meta name="og:title" content="Layer Cake"/> <meta name="twitter:title" content="Layer Cake"/>`);
		});

		$$renderer.push(`<div class="main svelte-1uha8ag"><div class="logo-container svelte-1uha8ag"><div id="logo" class="svelte-1uha8ag"></div> <h1 class="svelte-1uha8ag">Layer Cake</h1></div> <div id="dek" class="svelte-1uha8ag"><p class="svelte-1uha8ag">Layer Cake is a headless graphics framework for <a href="https://svelte.dev" target="_blank" rel="noreferrer" class="svelte-1uha8ag">Svelte</a>. It uses the measurements of your target div and your data extents to create scales that <span class="strong svelte-1uha8ag">stay synced</span> on layout changes. Use these scales to organize multiple, <span class="strong svelte-1uha8ag">mostly-reusable Svelte components</span>, whether they be SVG, HTML,
			Canvas or WebGL. Since they all share the same coordinate space, you can build your graphic
			one layer at a time. It can also be used to easily create <span class="strong svelte-1uha8ag">responsive graphics server-side</span> that <a href="#server-side" class="svelte-1uha8ag">work without JavaScript</a>.</p> <p class="svelte-1uha8ag">Unlike other libraries, <a href="/components" class="svelte-1uha8ag">chart components</a> live <span class="strong svelte-1uha8ag">inside your project</span>, so you have complete control for <span class="strong svelte-1uha8ag">customization</span>. It also includes some handy <a href="/guide#helper-functions" class="svelte-1uha8ag">helper functions</a> to help format your data into the right shape.</p> <p class="svelte-1uha8ag">Read the <a href="guide" class="svelte-1uha8ag">guide</a>, try the <a href="https://github.com/mhkeller/layercake-template" target="_blank" rel="noreferrer" class="svelte-1uha8ag">starter template</a> or check out the <a href="components" class="svelte-1uha8ag">example components</a>. See the examples below and even
			edit them live. Here's a sample of what the code looks like:</p></div> <div class="code-example svelte-1uha8ag"><pre class="svelte-1uha8ag">${$.html(hljs.highlight(codeExample, { language: 'svelte' }).value)}</pre></div> <div id="gallery"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let example = each_array[$$index];

			$$renderer.push(`<div class="gallery-item svelte-1uha8ag"><h4 class="title svelte-1uha8ag"><a${$.attr('href', `/example/${$.stringify(example.slug)}`)} class="svelte-1uha8ag">${$.escape(example.title)}</a></h4> `);

			if (example.component) {
				$$renderer.push('<!--[-->');
				example.component($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="section-hed svelte-1uha8ag" id="server-side"><h2 class="svelte-1uha8ag">Server-side rendering</h2> <p class="svelte-1uha8ag">Svelte makes it easy to render your project server side and Layer Cake has built-in helpers to
			make it even easier for charts. All of these examples below (except for their canvas
			components) will load and be responsive without client-side JavaScript. The advantage is that
			you can see the chart as soon as the page loads, avoiding blank placeholder spaces. HTML
			charts use percentage-based scales and SVG charts take advantage of certain <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox" target="_blank" rel="noreferrer" class="svelte-1uha8ag">viewBox</a> and CSS settings that Rich Harris, Svelte's creator, outlined in <a href="https://dev.to/richharris/a-new-technique-for-making-responsive-javascript-free-charts-gmp" target="_blank" rel="noreferrer" class="svelte-1uha8ag">this blog post</a>.</p> <p>For shapes that are difficult to render using percentages, such as swoopy arrows, Layer Cake
			makes it easy to superimpose client-side components that will hydrate once JavaScript is
			available. See the annotated column example below.</p></div> <div id="ssr-gallery"><!--[-->`);

		const each_array_1 = $.ensure_array_like(examplesSsr);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let example = each_array_1[$$index_1];

			$$renderer.push(`<div${$.attr_class('gallery-item svelte-1uha8ag', void 0, { 'scaled': example.title.toLowerCase().includes('map') })}><h4 class="title svelte-1uha8ag"><a${$.attr('href', `/example-ssr/${$.stringify(example.slug)}`)} class="svelte-1uha8ag">${$.escape(example.title)}</a></h4> `);

			if (example.component) {
				$$renderer.push('<!--[-->');
				example.component($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}