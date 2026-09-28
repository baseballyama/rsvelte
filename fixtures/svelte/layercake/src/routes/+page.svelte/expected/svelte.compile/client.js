import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import hljs from 'highlight.js';
import examples from './_examples.js';
import examplesSsr from './_examples_ssr.js';
import hljsDefineSvelte from '../_modules/hljsDefineSvelte.js';

var root = $.from_html(`<meta name="og:title" content="Layer Cake"/> <meta name="twitter:title" content="Layer Cake"/>`, 1);
var root_1 = $.from_html(`<div class="gallery-item svelte-1uha8ag"><h4 class="title svelte-1uha8ag"><a class="svelte-1uha8ag"> </a></h4> <!></div>`);
var root_2 = $.from_html(`<div><h4 class="title svelte-1uha8ag"><a class="svelte-1uha8ag"> </a></h4> <!></div>`);

var root_3 = $.from_html(`<div class="main svelte-1uha8ag"><div class="logo-container svelte-1uha8ag"><div id="logo" class="svelte-1uha8ag"></div> <h1 class="svelte-1uha8ag">Layer Cake</h1></div> <div id="dek" class="svelte-1uha8ag"><p class="svelte-1uha8ag">Layer Cake is a headless graphics framework for <a href="https://svelte.dev" target="_blank" rel="noreferrer" class="svelte-1uha8ag">Svelte</a>. It uses the measurements of your target div and your data extents to create scales that <span class="strong svelte-1uha8ag">stay synced</span> on layout changes. Use these scales to organize multiple, <span class="strong svelte-1uha8ag">mostly-reusable Svelte components</span>, whether they be SVG, HTML,
			Canvas or WebGL. Since they all share the same coordinate space, you can build your graphic
			one layer at a time. It can also be used to easily create <span class="strong svelte-1uha8ag">responsive graphics server-side</span> that <a href="#server-side" class="svelte-1uha8ag">work without JavaScript</a>.</p> <p class="svelte-1uha8ag">Unlike other libraries, <a href="/components" class="svelte-1uha8ag">chart components</a> live <span class="strong svelte-1uha8ag">inside your project</span>, so you have complete control for <span class="strong svelte-1uha8ag">customization</span>. It also includes some handy <a href="/guide#helper-functions" class="svelte-1uha8ag">helper functions</a> to help format your data into the right shape.</p> <p class="svelte-1uha8ag">Read the <a href="guide" class="svelte-1uha8ag">guide</a>, try the <a href="https://github.com/mhkeller/layercake-template" target="_blank" rel="noreferrer" class="svelte-1uha8ag">starter template</a> or check out the <a href="components" class="svelte-1uha8ag">example components</a>. See the examples below and even
			edit them live. Here's a sample of what the code looks like:</p></div> <div class="code-example svelte-1uha8ag"><pre class="svelte-1uha8ag"></pre></div> <div id="gallery"></div> <div class="section-hed svelte-1uha8ag" id="server-side"><h2 class="svelte-1uha8ag">Server-side rendering</h2> <p class="svelte-1uha8ag">Svelte makes it easy to render your project server side and Layer Cake has built-in helpers to
			make it even easier for charts. All of these examples below (except for their canvas
			components) will load and be responsive without client-side JavaScript. The advantage is that
			you can see the chart as soon as the page loads, avoiding blank placeholder spaces. HTML
			charts use percentage-based scales and SVG charts take advantage of certain <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox" target="_blank" rel="noreferrer" class="svelte-1uha8ag">viewBox</a> and CSS settings that Rich Harris, Svelte's creator, outlined in <a href="https://dev.to/richharris/a-new-technique-for-making-responsive-javascript-free-charts-gmp" target="_blank" rel="noreferrer" class="svelte-1uha8ag">this blog post</a>.</p> <p>For shapes that are difficult to render using percentages, such as swoopy arrows, Layer Cake
			makes it easy to superimpose client-side components that will hydrate once JavaScript is
			available. See the annotated column example below.</p></div> <div id="ssr-gallery"></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
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

	var div = root_3();

	$.head('1uha8ag', ($$anchor) => {
		var fragment = root();

		$.next(2);

		$.effect(() => {
			$.document.title = 'Layer Cake';
		});

		$.append($$anchor, fragment);
	});

	var div_1 = $.sibling($.child(div), 4);
	var pre = $.child(div_1);

	$.html(pre, () => hljs.highlight(codeExample, { language: 'svelte' }).value, true);
	$.reset(pre);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);

	$.each(div_2, 21, () => examples, $.index, ($$anchor, example) => {
		var div_3 = root_1();
		var h4 = $.child(div_3);
		var a = $.child(h4);
		var text = $.only_child(a, true);

		$.reset(h4);

		var node = $.sibling(h4, 2);

		$.component(node, () => $.get(example).component, ($$anchor, example_component) => {
			example_component($$anchor, {});
		});

		$.reset(div_3);

		$.template_effect(() => {
			$.set_attribute(a, 'href', `/example/${$.get(example).slug ?? ''}`);
			$.set_text(text, $.get(example).title);
		});

		$.append($$anchor, div_3);
	});

	$.reset(div_2);

	var div_4 = $.sibling(div_2, 4);

	$.each(div_4, 21, () => examplesSsr, $.index, ($$anchor, example) => {
		var div_5 = root_2();
		let classes;
		var h4_1 = $.child(div_5);
		var a_1 = $.child(h4_1);
		var text_1 = $.only_child(a_1, true);

		$.reset(h4_1);

		var node_1 = $.sibling(h4_1, 2);

		$.component(node_1, () => $.get(example).component, ($$anchor, example_component_1) => {
			example_component_1($$anchor, {});
		});

		$.reset(div_5);

		$.template_effect(
			($0) => {
				classes = $.set_class(div_5, 1, 'gallery-item svelte-1uha8ag', null, classes, { scaled: $0 });
				$.set_attribute(a_1, 'href', `/example-ssr/${$.get(example).slug ?? ''}`);
				$.set_text(text_1, $.get(example).title);
			},
			[() => $.get(example).title.toLowerCase().includes('map')]
		);

		$.append($$anchor, div_5);
	});

	$.reset(div_4);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}