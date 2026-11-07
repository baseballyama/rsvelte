import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#24292E;--shiki-dark:#DBD7CAEE">function onMount</span><span style="color:#24292E;--shiki-dark:#666666">&#x3C;</span><span style="color:#005CC5;--shiki-dark:#B8A965">T</span><span style="color:#24292E;--shiki-dark:#666666">></span><span style="color:#24292E;--shiki-dark:#DBD7CAEE">(fn: () => NotFunction</span><span style="color:#24292E;--shiki-dark:#666666">&#x3C;</span><span style="color:#005CC5;--shiki-dark:#B8A965">T</span><span style="color:#24292E;--shiki-dark:#666666">></span><span style="color:#24292E;--shiki-dark:#DBD7CAEE"> | Promise</span><span style="color:#24292E;--shiki-dark:#666666">&#x3C;</span><span style="color:#005CC5;--shiki-dark:#B8A965">NotFunction</span><span style="color:#24292E;--shiki-dark:#DBD7CAEE">&#x3C;</span><span style="color:#005CC5;--shiki-dark:#B8A965">T</span><span style="color:#24292E;--shiki-dark:#666666">></span><span style="color:#24292E;--shiki-dark:#DBD7CAEE">> | (() => any)): void</span></code><div class="twoslash-popup-docs"><p><code>onMount</code>, like <a href="https://svelte.dev/docs/svelte/$effect"><code>$effect</code></a>, schedules a function to run as soon as the component has been mounted to the DOM.
Unlike <code>$effect</code>, the provided function only runs once.</p>
<p>It must be called during the component's initialisation (but doesn't need to live <em>inside</em> the component;
it can be called from an external module). If a function is returned <em>synchronously</em> from <code>onMount</code>,
it will be called when the component is unmounted.</p>
<p><code>onMount</code> functions do not run during <a href="https://svelte.dev/docs/svelte/svelte-server#render">server-side rendering</a>.</p></div></span>`);

var root_1 = $.from_html(`<span>onMount</span>`);
var root_2 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#24292E;--shiki-dark:#DBD7CAEE">let message: any</span></code></span>`);
var root_3 = $.from_html(`<span>message</span>`);

var root_4 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><pre class="shiki shiki-themes github-light vitesse-dark" style="background-color:#fff;--shiki-dark-bg:#121212;color:#24292e;--shiki-dark:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#24292E;--shiki-dark:#DBD7CAEE">function $props(): any</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#DBD7CAEE">namespace $props</span></span></code></pre></code><div class="twoslash-popup-docs"><p>Declares the props that a component accepts. Example:</p>
<pre class="shiki shiki-themes github-light vitesse-dark" style="background-color:#fff;--shiki-dark-bg:#121212;color:#24292e;--shiki-dark:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#D73A49;--shiki-dark:#CB7676">let</span><span style="color:#24292E;--shiki-dark:#666666"> &#123;</span><span style="color:#24292E;--shiki-dark:#BD976A"> optionalProp</span><span style="color:#D73A49;--shiki-dark:#666666"> =</span><span style="color:#005CC5;--shiki-dark:#4C9A91"> 42</span><span style="color:#24292E;--shiki-dark:#666666">,</span><span style="color:#24292E;--shiki-dark:#BD976A"> requiredProp</span><span style="color:#24292E;--shiki-dark:#666666">,</span><span style="color:#24292E;--shiki-dark:#BD976A"> bindableProp</span><span style="color:#D73A49;--shiki-dark:#666666"> =</span><span style="color:#6F42C1;--shiki-dark:#80A665"> $bindable</span><span style="color:#24292E;--shiki-dark:#666666">()</span><span style="color:#24292E;--shiki-dark:#666666"> &#125;</span><span style="color:#D73A49;--shiki-dark:#666666">:</span><span style="color:#24292E;--shiki-dark:#666666"> &#123; </span><span style="color:#E36209;--shiki-dark:#BD976A">optionalProp</span><span style="color:#D73A49;--shiki-dark:#CB7676">?</span><span style="color:#D73A49;--shiki-dark:#666666">:</span><span style="color:#005CC5;--shiki-dark:#5DA994"> number</span><span style="color:#24292E;--shiki-dark:#666666">; </span><span style="color:#E36209;--shiki-dark:#BD976A">requiredProps</span><span style="color:#D73A49;--shiki-dark:#666666">:</span><span style="color:#005CC5;--shiki-dark:#5DA994"> string</span><span style="color:#24292E;--shiki-dark:#666666">; </span><span style="color:#E36209;--shiki-dark:#BD976A">bindableProp</span><span style="color:#D73A49;--shiki-dark:#666666">:</span><span style="color:#005CC5;--shiki-dark:#5DA994"> boolean</span><span style="color:#24292E;--shiki-dark:#666666"> &#125; </span><span style="color:#D73A49;--shiki-dark:#666666">=</span><span style="color:#6F42C1;--shiki-dark:#80A665"> $props</span><span style="color:#24292E;--shiki-dark:#666666">();</span></span></code></pre>
<p><a href="https://svelte.dev/docs/svelte/$props">https://svelte.dev/docs/svelte/$props</a></p></div></span>`);

var root_5 = $.from_html(`<span>$</span>`);
var root_6 = $.from_html(`<span>props</span>`);
var root_7 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#24292E;--shiki-dark:#DBD7CAEE">let count: number</span></code></span>`);
var root_8 = $.from_html(`<span>count</span>`);

var root_9 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><pre class="shiki shiki-themes github-light vitesse-dark" style="background-color:#fff;--shiki-dark-bg:#121212;color:#24292e;--shiki-dark:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#24292E;--shiki-dark:#DBD7CAEE">function $state</span><span style="color:#24292E;--shiki-dark:#666666">&#x3C;</span><span style="color:#24292E;--shiki-dark:#DBD7CAEE">0</span><span style="color:#24292E;--shiki-dark:#666666">></span><span style="color:#24292E;--shiki-dark:#DBD7CAEE">(initial: 0): 0 (+1 overload)</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#DBD7CAEE">namespace $state</span></span></code></pre></code><div class="twoslash-popup-docs"><p>Declares reactive state.</p>
<p>Example:</p>
<pre class="shiki shiki-themes github-light vitesse-dark" style="background-color:#fff;--shiki-dark-bg:#121212;color:#24292e;--shiki-dark:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#D73A49;--shiki-dark:#CB7676">let</span><span style="color:#24292E;--shiki-dark:#BD976A"> count</span><span style="color:#D73A49;--shiki-dark:#666666"> =</span><span style="color:#6F42C1;--shiki-dark:#80A665"> $state</span><span style="color:#24292E;--shiki-dark:#666666">(</span><span style="color:#005CC5;--shiki-dark:#4C9A91">0</span><span style="color:#24292E;--shiki-dark:#666666">);</span></span></code></pre>
<p><a href="https://svelte.dev/docs/svelte/$state">https://svelte.dev/docs/svelte/$state</a></p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags"><span class="twoslash-popup-docs-tag"><span class="twoslash-popup-docs-tag-name">@param</span><span class="twoslash-popup-docs-tag-value"><code>initial</code>  The initial value</span></span></div></span>`);

var root_10 = $.from_html(`<span>state</span>`);

var root_11 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#24292E;--shiki-dark:#DBD7CAEE">onMount</span><span style="color:#24292E;--shiki-dark:#666666">&#x3C;</span><span style="color:#22863A;--shiki-dark:#4D9375">void</span><span style="color:#24292E;--shiki-dark:#666666">></span><span style="color:#24292E;--shiki-dark:#DBD7CAEE">(fn: () => void | (() => any) | Promise</span><span style="color:#24292E;--shiki-dark:#666666">&#x3C;</span><span style="color:#22863A;--shiki-dark:#4D9375">void</span><span style="color:#24292E;--shiki-dark:#666666">></span><span style="color:#24292E;--shiki-dark:#DBD7CAEE">): void</span></code><div class="twoslash-popup-docs"><p><code>onMount</code>, like <a href="https://svelte.dev/docs/svelte/$effect"><code>$effect</code></a>, schedules a function to run as soon as the component has been mounted to the DOM.
Unlike <code>$effect</code>, the provided function only runs once.</p>
<p>It must be called during the component's initialisation (but doesn't need to live <em>inside</em> the component;
it can be called from an external module). If a function is returned <em>synchronously</em> from <code>onMount</code>,
it will be called when the component is unmounted.</p>
<p><code>onMount</code> functions do not run during <a href="https://svelte.dev/docs/svelte/svelte-server#render">server-side rendering</a>.</p></div></span>`);

var root_12 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#24292E;--shiki-dark:#DBD7CAEE">var console: Console</span></code></span>`);
var root_13 = $.from_html(`<span>console</span>`);

var root_14 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#24292E;--shiki-dark:#DBD7CAEE">Console.log(...data: any[]): void</span></code><div class="twoslash-popup-docs"><p>The <strong><code>console.log()</code></strong> static method outputs a message to the console.</p>
<p><a href="https://developer.mozilla.org/docs/Web/API/console/log_static">MDN Reference</a></p></div></span>`);

var root_15 = $.from_html(`<span>log</span>`);

var root_16 = $.from_html(`<pre class="shiki shiki-themes github-light vitesse-dark twoslash lsp" style="background-color:#fff;--shiki-dark-bg:#121212;color:#24292e;--shiki-dark:#dbd7caee" tabindex="0"><code><span class="line"><span style="color:#24292E;--shiki-dark:#666666">&#x3C;</span><span style="color:#22863A;--shiki-dark:#4D9375">script</span><span style="color:#24292E;--shiki-dark:#666666">></span></span>
<span class="line"><span style="color:#D73A49;--shiki-dark:#4D9375">  import</span><span style="color:#24292E;--shiki-dark:#666666"> &#123;</span><span style="color:#24292E;--shiki-dark:#BD976A"> </span><span style="color:#24292E;--shiki-dark:#BD976A"><!></span><span style="color:#24292E;--shiki-dark:#666666"> &#125;</span><span style="color:#D73A49;--shiki-dark:#4D9375"> from</span><span style="color:#032F62;--shiki-dark:#C98A7D77"> '</span><span style="color:#032F62;--shiki-dark:#C98A7D">svelte</span><span style="color:#032F62;--shiki-dark:#C98A7D77">'</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;--shiki-dark:#CB7676">  let</span><span style="color:#24292E;--shiki-dark:#666666"> &#123;</span><span style="color:#24292E;--shiki-dark:#BD976A"> </span><span style="color:#24292E;--shiki-dark:#BD976A"><!></span><span style="color:#D73A49;--shiki-dark:#666666"> =</span><span style="color:#032F62;--shiki-dark:#C98A7D77"> '</span><span style="color:#032F62;--shiki-dark:#C98A7D">World</span><span style="color:#032F62;--shiki-dark:#C98A7D77">'</span><span style="color:#24292E;--shiki-dark:#666666"> &#125;</span><span style="color:#D73A49;--shiki-dark:#666666"> =</span><span style="color:#24292E;--shiki-dark:#666666"> </span><span style="color:#24292E;--shiki-dark:#666666"><!></span><span style="color:#6F42C1;--shiki-dark:#80A665"><!></span><span style="color:#24292E;--shiki-dark:#666666">()</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;--shiki-dark:#CB7676">  let</span><span style="color:#24292E;--shiki-dark:#BD976A"> </span><span style="color:#24292E;--shiki-dark:#BD976A"><!></span><span style="color:#D73A49;--shiki-dark:#666666"> =</span><span style="color:#24292E;--shiki-dark:#666666"> </span><span style="color:#24292E;--shiki-dark:#666666"><!></span><span style="color:#6F42C1;--shiki-dark:#80A665"><!></span><span style="color:#24292E;--shiki-dark:#666666">(</span><span style="color:#005CC5;--shiki-dark:#4C9A91">0</span><span style="color:#24292E;--shiki-dark:#666666">)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6F42C1;--shiki-dark:#80A665">  </span><span style="color:#6F42C1;--shiki-dark:#80A665"><!></span><span style="color:#24292E;--shiki-dark:#666666">(()</span><span style="color:#D73A49;--shiki-dark:#666666"> =></span><span style="color:#24292E;--shiki-dark:#666666"> &#123;</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#BD976A">    </span><span style="color:#24292E;--shiki-dark:#BD976A"><!></span><span style="color:#24292E;--shiki-dark:#666666">.</span><span style="color:#6F42C1;--shiki-dark:#80A665"><!></span><span style="color:#24292E;--shiki-dark:#666666">(</span><span style="color:#032F62;--shiki-dark:#C98A7D77">'</span><span style="color:#032F62;--shiki-dark:#C98A7D">mount</span><span style="color:#032F62;--shiki-dark:#C98A7D77">'</span><span style="color:#24292E;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#666666">  &#125;)</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#666666">&#x3C;/</span><span style="color:#22863A;--shiki-dark:#4D9375">script</span><span style="color:#24292E;--shiki-dark:#666666">></span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#666666">&#x3C;</span><span style="color:#22863A;--shiki-dark:#4D9375">button</span><span style="color:#6F42C1;--shiki-dark:#BD976A"> onclick</span><span style="color:#24292E;--shiki-dark:#666666">=&#123;()</span><span style="color:#D73A49;--shiki-dark:#666666"> =></span><span style="color:#24292E;--shiki-dark:#BD976A"> </span><span style="color:#24292E;--shiki-dark:#BD976A"><!></span><span style="color:#D73A49;--shiki-dark:#CB7676">++</span><span style="color:#24292E;--shiki-dark:#666666">&#125;></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#DBD7CAEE">  Count is: </span><span style="color:#24292E;--shiki-dark:#666666">&#123;</span><span style="color:#24292E;--shiki-dark:#BD976A"><!></span><span style="color:#24292E;--shiki-dark:#666666">&#125;</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#666666">&#x3C;/</span><span style="color:#22863A;--shiki-dark:#4D9375">button</span><span style="color:#24292E;--shiki-dark:#666666">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#666666">&#x3C;</span><span style="color:#22863A;--shiki-dark:#4D9375">div</span><span style="color:#6F42C1;--shiki-dark:#BD976A"> class</span><span style="color:#24292E;--shiki-dark:#666666">=</span><span style="color:#032F62;--shiki-dark:#C98A7D77">"</span><span style="color:#032F62;--shiki-dark:#C98A7D">text-6</span><span style="color:#032F62;--shiki-dark:#C98A7D77">"</span><span style="color:#24292E;--shiki-dark:#666666">></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#DBD7CAEE">  Hello, </span><span style="color:#24292E;--shiki-dark:#666666">&#123;</span><span style="color:#24292E;--shiki-dark:#BD976A"><!></span><span style="color:#24292E;--shiki-dark:#666666">&#125;</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#666666">&#x3C;/</span><span style="color:#22863A;--shiki-dark:#4D9375">div</span><span style="color:#24292E;--shiki-dark:#666666">></span></span>
<span class="line"></span></code></pre>`);

export default function Test_result($$anchor) {
	var pre = root_16();
	var code = $.child(pre);
	var span = $.sibling($.child(code), 2);
	var span_1 = $.sibling($.child(span), 3);
	var node = $.child(span_1);

	{
		const floatingContent = ($$anchor) => {
			var span_2 = root();

			$.append($$anchor, span_2);
		};

		Floating(node, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_3 = root_1();

				$.append($$anchor, span_3);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_1);
	$.next(5);
	$.reset(span);

	var span_4 = $.sibling(span, 4);
	var span_5 = $.sibling($.child(span_4), 3);
	var node_1 = $.child(span_5);

	{
		const floatingContent = ($$anchor) => {
			var span_6 = root_2();

			$.append($$anchor, span_6);
		};

		Floating(node_1, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_7 = root_3();

				$.append($$anchor, span_7);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_5);

	var span_8 = $.sibling(span_5, 8);
	var node_2 = $.child(span_8);

	{
		const floatingContent = ($$anchor) => {
			var span_9 = root_4();

			$.append($$anchor, span_9);
		};

		Floating(node_2, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_10 = root_5();

				$.append($$anchor, span_10);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_8);

	var span_11 = $.sibling(span_8);
	var node_3 = $.child(span_11);

	{
		const floatingContent = ($$anchor) => {
			var span_12 = root_4();

			$.append($$anchor, span_12);
		};

		Floating(node_3, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_13 = root_6();

				$.append($$anchor, span_13);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_11);
	$.next();
	$.reset(span_4);

	var span_14 = $.sibling(span_4, 4);
	var span_15 = $.sibling($.child(span_14), 2);
	var node_4 = $.child(span_15);

	{
		const floatingContent = ($$anchor) => {
			var span_16 = root_7();

			$.append($$anchor, span_16);
		};

		Floating(node_4, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_17 = root_8();

				$.append($$anchor, span_17);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_15);

	var span_18 = $.sibling(span_15, 3);
	var node_5 = $.child(span_18);

	{
		const floatingContent = ($$anchor) => {
			var span_19 = root_9();

			$.append($$anchor, span_19);
		};

		Floating(node_5, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_20 = root_5();

				$.append($$anchor, span_20);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_18);

	var span_21 = $.sibling(span_18);
	var node_6 = $.child(span_21);

	{
		const floatingContent = ($$anchor) => {
			var span_22 = root_9();

			$.append($$anchor, span_22);
		};

		Floating(node_6, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_23 = root_10();

				$.append($$anchor, span_23);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_21);
	$.next(3);
	$.reset(span_14);

	var span_24 = $.sibling(span_14, 4);
	var span_25 = $.sibling($.child(span_24));
	var node_7 = $.child(span_25);

	{
		const floatingContent = ($$anchor) => {
			var span_26 = root_11();

			$.append($$anchor, span_26);
		};

		Floating(node_7, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_27 = root_1();

				$.append($$anchor, span_27);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_25);
	$.next(3);
	$.reset(span_24);

	var span_28 = $.sibling(span_24, 2);
	var span_29 = $.sibling($.child(span_28));
	var node_8 = $.child(span_29);

	{
		const floatingContent = ($$anchor) => {
			var span_30 = root_12();

			$.append($$anchor, span_30);
		};

		Floating(node_8, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_31 = root_13();

				$.append($$anchor, span_31);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_29);

	var span_32 = $.sibling(span_29, 2);
	var node_9 = $.child(span_32);

	{
		const floatingContent = ($$anchor) => {
			var span_33 = root_14();

			$.append($$anchor, span_33);
		};

		Floating(node_9, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_34 = root_15();

				$.append($$anchor, span_34);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_32);
	$.next(5);
	$.reset(span_28);

	var span_35 = $.sibling(span_28, 8);
	var span_36 = $.sibling($.child(span_35), 6);
	var node_10 = $.child(span_36);

	{
		const floatingContent = ($$anchor) => {
			var span_37 = root_7();

			$.append($$anchor, span_37);
		};

		Floating(node_10, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_38 = root_8();

				$.append($$anchor, span_38);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_36);
	$.next(2);
	$.reset(span_35);

	var span_39 = $.sibling(span_35, 2);
	var span_40 = $.sibling($.child(span_39), 2);
	var node_11 = $.child(span_40);

	{
		const floatingContent = ($$anchor) => {
			var span_41 = root_7();

			$.append($$anchor, span_41);
		};

		Floating(node_11, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_42 = root_8();

				$.append($$anchor, span_42);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_40);
	$.next();
	$.reset(span_39);

	var span_43 = $.sibling(span_39, 6);
	var span_44 = $.sibling($.child(span_43), 2);
	var node_12 = $.child(span_44);

	{
		const floatingContent = ($$anchor) => {
			var span_45 = root_2();

			$.append($$anchor, span_45);
		};

		Floating(node_12, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_46 = root_3();

				$.append($$anchor, span_46);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_44);
	$.next();
	$.reset(span_43);
	$.next(4);
	$.reset(code);
	$.reset(pre);
	$.append($$anchor, pre);
}