import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> defaultTheme</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-light-font-style:inherit;--shiki-dark:#FFCB8B;--shiki-dark-font-style:italic"> ThemeDefault</span></code></span>`);
var root_1 = $.from_html(`<span>defaultTheme</span>`);
var root_2 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> sveltepress</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#999999;--shiki-dark:#D9F5DD"> (</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#D7DBE0;--shiki-dark-font-style:italic">options</span><span style="color:#AB5959;--shiki-dark:#7FDBCA">?</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-light-font-style:inherit;--shiki-dark:#FFCB8B;--shiki-dark-font-style:italic"> SveltepressVitePluginOptions</span><span style="color:#999999;--shiki-dark:#D9F5DD">)</span><span style="color:#999999;--shiki-dark:#C792EA"> =></span><span style="color:#2E8F82;--shiki-light-font-style:inherit;--shiki-dark:#FFCB8B;--shiki-dark-font-style:italic"> PluginOption</span></code></span>`);
var root_3 = $.from_html(`<span>sveltepress</span>`);

var root_4 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#AB5959;--shiki-dark:#C792EA">function</span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> defineConfig</span><span style="color:#999999;--shiki-dark:#D9F5DD">(</span><span style="color:#B07D48;--shiki-dark:#D7DBE0">config</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-dark:#FFCB8B"> UserConfig</span><span style="color:#999999;--shiki-dark:#D9F5DD">)</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-dark:#FFCB8B"> UserConfig</span><span style="color:#999999;--shiki-dark:#D6DEEB"> (</span><span style="color:#393A34;--shiki-dark:#D6DEEB">+</span><span style="color:#2F798A;--shiki-dark:#F78C6C">5</span><span style="color:#2E8F82;--shiki-dark:#FFCB8B"> overloads</span><span style="color:#999999;--shiki-dark:#D6DEEB">)</span></code><div class="twoslash-popup-docs"><p>Type helper to make it easier to use vite.config.ts
accepts a direct</p>
<p>UserConfig</p>
<p>object, or a function that returns it.
The function receives a</p>
<p>ConfigEnv</p>
<p>object.</p></div></span>`);

var root_5 = $.from_html(`<span>defineConfig</span>`);
var root_6 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#B07D48;--shiki-dark:#D6DEEB">UserConfig</span><span style="color:#999999;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">.</span><span style="color:#B07D48;--shiki-dark:#BAEBE2">plugins</span><span style="color:#AB5959;--shiki-dark:#C792EA">?:</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"> PluginOption</span><span style="color:#999999;--shiki-dark:#D6DEEB">[]</span><span style="color:#AB5959;--shiki-dark:#C792EA"> |</span><span style="color:#AB5959;--shiki-dark:#82AAFF"> undefined</span></code><div class="twoslash-popup-docs"><p>Array of vite plugins to use.</p></div></span>`);
var root_7 = $.from_html(`<span>plugins</span>`);
var root_8 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#AB5959;--shiki-dark:#C792EA">function</span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> sveltepress</span><span style="color:#999999;--shiki-dark:#D9F5DD">(</span><span style="color:#B07D48;--shiki-dark:#D7DBE0">options</span><span style="color:#AB5959;--shiki-dark:#7FDBCA">?</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-dark:#FFCB8B"> SveltepressVitePluginOptions</span><span style="color:#999999;--shiki-dark:#D9F5DD">)</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-dark:#FFCB8B"> PluginOption</span></code></span>`);
var root_9 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#B07D48;--shiki-dark:#D6DEEB">SveltepressVitePluginOptions</span><span style="color:#999999;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">.</span><span style="color:#B07D48;--shiki-dark:#BAEBE2">theme</span><span style="color:#AB5959;--shiki-dark:#C792EA">?:</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"> ResolvedTheme</span><span style="color:#AB5959;--shiki-dark:#C792EA"> |</span><span style="color:#AB5959;--shiki-dark:#82AAFF"> undefined</span></code></span>`);
var root_10 = $.from_html(`<span>theme</span>`);
var root_11 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#AB5959;--shiki-dark:#C792EA">function</span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> defaultTheme</span><span style="color:#999999;--shiki-dark:#D9F5DD">(</span><span style="color:#B07D48;--shiki-dark:#D7DBE0">themeOptions</span><span style="color:#AB5959;--shiki-dark:#7FDBCA">?</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-dark:#FFCB8B"> DefaultThemeOptions</span><span style="color:#999999;--shiki-dark:#7FDBCA"> |</span><span style="color:#AB5959;--shiki-dark:#C5E478"> undefined</span><span style="color:#999999;--shiki-dark:#D9F5DD">)</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-dark:#FFCB8B"> ResolvedTheme</span></code></span>`);

var root_12 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><pre class="shiki shiki-themes vitesse-light night-owl" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#B07D48;--shiki-dark:#D6DEEB">DefaultThemeOptions</span><span style="color:#999999;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">.</span><span style="color:#B07D48;--shiki-dark:#BAEBE2">highlighter</span><span style="color:#AB5959;--shiki-dark:#C792EA">?:</span><span style="color:#999999;--shiki-dark:#D6DEEB"> &#123;</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">    languages?: </span><span style="color:#B07D48;--shiki-dark:#D6DEEB">BundledLanguage</span><span style="color:#999999;--shiki-dark:#D6DEEB">[];</span></span>
<span class="line"><span style="color:#B07D48;--shiki-dark:#D6DEEB">    themeLight</span><span style="color:#AB5959;--shiki-dark:#C792EA">?:</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"> BundledTheme</span><span style="color:#999999;--shiki-dark:#D6DEEB">;</span></span>
<span class="line"><span style="color:#B07D48;--shiki-dark:#D6DEEB">    themeDark</span><span style="color:#AB5959;--shiki-dark:#C792EA">?:</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"> BundledTheme</span><span style="color:#999999;--shiki-dark:#D6DEEB">;</span></span>
<span class="line"><span style="color:#B07D48;--shiki-dark:#D6DEEB">    twoslash</span><span style="color:#AB5959;--shiki-dark:#C792EA">?:</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"> boolean</span><span style="color:#AB5959;--shiki-dark:#C792EA"> |</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"> CreateTwoslashSvelteOptions</span><span style="color:#999999;--shiki-dark:#D6DEEB">;</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">&#125;</span><span style="color:#AB5959;--shiki-dark:#C792EA"> |</span><span style="color:#AB5959;--shiki-dark:#82AAFF"> undefined</span></span></code></pre></code></span>`);

var root_13 = $.from_html(`<span>highlighter</span>`);
var root_14 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#B07D48;--shiki-dark:#D6DEEB">twoslash</span><span style="color:#AB5959;--shiki-dark:#C792EA">?:</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"> boolean</span><span style="color:#AB5959;--shiki-dark:#C792EA"> |</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"> CreateTwoslashSvelteOptions</span><span style="color:#AB5959;--shiki-dark:#C792EA"> |</span><span style="color:#AB5959;--shiki-dark:#82AAFF"> undefined</span></code></span>`);
var root_15 = $.from_html(`<span>twoslash</span>`);

var root_16 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#393A34;--shiki-dark:#D6DEEB">function onMount</span><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;</span><span style="color:#998418;--shiki-dark:#C5E478">T</span><span style="color:#999999;--shiki-dark:#7FDBCA">></span><span style="color:#393A34;--shiki-dark:#D6DEEB">(fn: () => NotFunction</span><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;</span><span style="color:#998418;--shiki-dark:#C5E478">T</span><span style="color:#999999;--shiki-dark:#7FDBCA">></span><span style="color:#393A34;--shiki-dark:#D6DEEB"> | Promise</span><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;</span><span style="color:#998418;--shiki-dark:#C5E478">NotFunction</span><span style="color:#393A34;--shiki-dark:#7FDBCA">&#x3C;</span><span style="color:#998418;--shiki-dark:#C5E478">T</span><span style="color:#999999;--shiki-dark:#7FDBCA">></span><span style="color:#393A34;--shiki-dark:#D6DEEB">> | (() => any)): void</span></code><div class="twoslash-popup-docs"><p><code>onMount</code>, like <a href="https://svelte.dev/docs/svelte/$effect"><code>$effect</code></a>, schedules a function to run as soon as the component has been mounted to the DOM.
Unlike <code>$effect</code>, the provided function only runs once.</p>
<p>It must be called during the component's initialisation (but doesn't need to live <em>inside</em> the component;
it can be called from an external module). If a function is returned <em>synchronously</em> from <code>onMount</code>,
it will be called when the component is unmounted.</p>
<p><code>onMount</code> functions do not run during <a href="https://svelte.dev/docs/svelte/svelte-server#render">server-side rendering</a>.</p></div></span>`);

var root_17 = $.from_html(`<span>onMount</span>`);
var root_18 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#393A34;--shiki-dark:#D6DEEB">let message: any</span></code></span>`);
var root_19 = $.from_html(`<span>message</span>`);

var root_20 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><pre class="shiki shiki-themes vitesse-light night-owl" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#393A34;--shiki-dark:#D6DEEB">function $props(): any</span></span>
<span class="line"><span style="color:#393A34;--shiki-dark:#D6DEEB">namespace $props</span></span></code></pre></code><div class="twoslash-popup-docs"><p>Declares the props that a component accepts. Example:</p>
<pre class="shiki shiki-themes vitesse-light night-owl" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">let</span><span style="color:#999999;--shiki-dark:#C792EA"> &#123;</span><span style="color:#B07D48;--shiki-dark:#D7DBE0"> optionalProp</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#2F798A;--shiki-dark:#F78C6C"> 42</span><span style="color:#999999;--shiki-dark:#C792EA">,</span><span style="color:#B07D48;--shiki-dark:#D7DBE0"> requiredProp</span><span style="color:#999999;--shiki-dark:#C792EA">,</span><span style="color:#B07D48;--shiki-dark:#D7DBE0"> bindableProp</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> $bindable</span><span style="color:#999999;--shiki-dark:#D6DEEB">()</span><span style="color:#999999;--shiki-dark:#C792EA"> &#125;</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#999999;--shiki-dark:#C792EA"> &#123;</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#D6DEEB;--shiki-dark-font-style:italic"> optionalProp</span><span style="color:#AB5959;--shiki-dark:#7FDBCA">?</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-light-font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> number</span><span style="color:#999999;--shiki-dark:#C792EA">;</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#D6DEEB;--shiki-dark-font-style:italic"> requiredProps</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-light-font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> string</span><span style="color:#999999;--shiki-dark:#C792EA">;</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#D6DEEB;--shiki-dark-font-style:italic"> bindableProp</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-light-font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> boolean</span><span style="color:#999999;--shiki-dark:#C792EA"> &#125;</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> $props</span><span style="color:#999999;--shiki-dark:#D6DEEB">();</span></span></code></pre>
<p><a href="https://svelte.dev/docs/svelte/$props">https://svelte.dev/docs/svelte/$props</a></p></div></span>`);

var root_21 = $.from_html(`<span>$</span>`);
var root_22 = $.from_html(`<span>props</span>`);
var root_23 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#393A34;--shiki-dark:#D6DEEB">let count: number</span></code></span>`);
var root_24 = $.from_html(`<span>count</span>`);

var root_25 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><pre class="shiki shiki-themes vitesse-light night-owl" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#393A34;--shiki-dark:#D6DEEB">function $state</span><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;</span><span style="color:#393A34;--shiki-dark:#7FDBCA">0</span><span style="color:#999999;--shiki-dark:#7FDBCA">></span><span style="color:#393A34;--shiki-dark:#D6DEEB">(initial: 0): 0 (+1 overload)</span></span>
<span class="line"><span style="color:#393A34;--shiki-dark:#D6DEEB">namespace $state</span></span></code></pre></code><div class="twoslash-popup-docs"><p>Declares reactive state.</p>
<p>Example:</p>
<pre class="shiki shiki-themes vitesse-light night-owl" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">let</span><span style="color:#B07D48;--shiki-dark:#D7DBE0"> count</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> $state</span><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span style="color:#2F798A;--shiki-dark:#F78C6C">0</span><span style="color:#999999;--shiki-dark:#D6DEEB">);</span></span></code></pre>
<p><a href="https://svelte.dev/docs/svelte/$state">https://svelte.dev/docs/svelte/$state</a></p></div><div class="twoslash-popup-docs twoslash-popup-docs-tags"><span class="twoslash-popup-docs-tag"><span class="twoslash-popup-docs-tag-name">@param</span><span class="twoslash-popup-docs-tag-value"><code>initial</code>  The initial value</span></span></div></span>`);

var root_26 = $.from_html(`<span>state</span>`);

var root_27 = $.from_html(`<span class="twoslash-popup-container"><code class="twoslash-popup-code"><span style="color:#393A34;--shiki-dark:#D6DEEB">onMount</span><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;</span><span style="color:#1E754F;--shiki-dark:#CAECE6">void</span><span style="color:#999999;--shiki-dark:#7FDBCA">></span><span style="color:#393A34;--shiki-dark:#D6DEEB">(fn: () => void | (() => any) | Promise</span><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;</span><span style="color:#1E754F;--shiki-dark:#CAECE6">void</span><span style="color:#999999;--shiki-dark:#7FDBCA">></span><span style="color:#393A34;--shiki-dark:#D6DEEB">): void</span></code><div class="twoslash-popup-docs"><p><code>onMount</code>, like <a href="https://svelte.dev/docs/svelte/$effect"><code>$effect</code></a>, schedules a function to run as soon as the component has been mounted to the DOM.
Unlike <code>$effect</code>, the provided function only runs once.</p>
<p>It must be called during the component's initialisation (but doesn't need to live <em>inside</em> the component;
it can be called from an external module). If a function is returned <em>synchronously</em> from <code>onMount</code>,
it will be called when the component is unmounted.</p>
<p><code>onMount</code> functions do not run during <a href="https://svelte.dev/docs/svelte/svelte-server#render">server-side rendering</a>.</p></div></span>`);

var root_28 = $.from_html(
	`<p>This feature integrate <a href="https://github.com/twoslashes/twoslash">Twoslash</a></p> <p>All of the Typescript code blocks would provide inline type hover.</p> <h2>Enable twoslash</h2> <ul><li>Install @sveltepress/twoslash package</li></ul> <p>@install-pkg(@sveltepress/twoslash)</p> <ul><li>Config <code></code> to <code></code></li></ul> <div class="svp-code-block-wrapper"><div class="svp-code-block--title">vite.config.(js|ts)</div> <div class="svp-code-block"><div class="svp-code-block--command-line svp-code-block--diff-bg-add" style="top: calc(12em + 12px);"><div class="svp-code-block--diff-add">+</div></div> <div class="svp-code-block--command-line svp-code-block--diff-bg-add" style="top: calc(13.5em + 12px);"><div class="svp-code-block--diff-add">+</div></div> <div class="svp-code-block--command-line svp-code-block--diff-bg-add" style="top: calc(15em + 12px);"><div class="svp-code-block--diff-add">+</div></div> <pre class="shiki shiki-themes vitesse-light night-owl twoslash lsp" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#1E754F;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">import</span><span style="color:#999999;--shiki-dark:#D6DEEB"> &#123;</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"> </span><span style="color:#B07D48;--shiki-dark:#D6DEEB"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB"> &#125;</span><span style="color:#1E754F;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"> from</span><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span style="color:#B56959;--shiki-dark:#ECC48D">@sveltepress/theme-default</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span></span>
<span class="line"><span style="color:#1E754F;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">import</span><span style="color:#999999;--shiki-dark:#D6DEEB"> &#123;</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"> </span><span style="color:#B07D48;--shiki-dark:#D6DEEB"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB"> &#125;</span><span style="color:#1E754F;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"> from</span><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span style="color:#B56959;--shiki-dark:#ECC48D">@sveltepress/vite</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span></span>
<span class="line"><span style="color:#1E754F;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">import</span><span style="color:#999999;--shiki-dark:#D6DEEB"> &#123;</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"> </span><span style="color:#B07D48;--shiki-dark:#D6DEEB"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB"> &#125;</span><span style="color:#1E754F;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"> from</span><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span style="color:#B56959;--shiki-dark:#ECC48D">vite</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span></span>
<span class="line"></span>
<span class="line"><span style="color:#1E754F;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">export</span><span style="color:#1E754F;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"> default</span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> </span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB">(&#123;</span></span>
<span class="line"><span style="color:#998418;--shiki-dark:#D6DEEB">  </span><span style="color:#998418;--shiki-dark:#D6DEEB"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB">: [</span></span>
<span class="line"><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic">    </span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB">(&#123;</span></span>
<span class="line"><span style="color:#998418;--shiki-dark:#D6DEEB">      </span><span style="color:#998418;--shiki-dark:#D6DEEB"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB">: </span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB">(&#123;</span></span>
<span class="line"><span style="color:#998418;--shiki-dark:#D6DEEB">        </span><span style="color:#998418;--shiki-dark:#D6DEEB"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB">: &#123; </span></span>
<span class="line"><span style="color:#998418;--shiki-dark:#D6DEEB">          </span><span style="color:#998418;--shiki-dark:#D6DEEB"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB">: </span><span style="color:#1E754F;--shiki-dark:#FF5874">true</span><span style="color:#999999;--shiki-dark:#D6DEEB"> </span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">        &#125; </span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">      &#125;)</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">    &#125;)</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">  ]</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">&#125;)</span></span></code></pre> <div class="svp-code-block--lang">ts</div> <!></div></div> <h2>Basic type annotation</h2> <div class="svp-code-block-wrapper"><div class="svp-code-block"><pre class="shiki shiki-themes vitesse-light night-owl" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">\`\`\`</span><span style="color:#393A34;--shiki-dark:#D6DEEB">ts</span></span>
<span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> foo</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#1E754F;--shiki-light-font-style:inherit;--shiki-dark:#FF5874;--shiki-dark-font-style:italic"> false</span></span>
<span class="line"></span>
<span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> obj</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#999999;--shiki-dark:#C792EA"> &#123;</span></span>
<span class="line"><span style="color:#998418;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">  a</span><span style="color:#999999;--shiki-dark:#C792EA">:</span><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span style="color:#B56959;--shiki-dark:#ECC48D">a</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span><span style="color:#999999;--shiki-dark:#C792EA">,</span></span>
<span class="line"><span style="color:#998418;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">  b</span><span style="color:#999999;--shiki-dark:#C792EA">:</span><span style="color:#2F798A;--shiki-dark:#F78C6C"> 1</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#C792EA">&#125;</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">\`\`\`</span></span></code></pre> <div class="svp-code-block--lang">md</div> <!></div></div> <h2>Errors</h2> <div class="svp-code-block-wrapper"><div class="svp-code-block"><pre class="shiki shiki-themes vitesse-light night-owl" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">\`\`\`</span><span style="color:#393A34;--shiki-dark:#D6DEEB">ts</span></span>
<span class="line"><span style="color:#A0ADA0;--shiki-light-font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic">// @errors: 2304 2322</span></span>
<span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> foo</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-light-font-style:inherit;--shiki-dark:#FFCB8B;--shiki-dark-font-style:italic"> Foo</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#AB5959;--shiki-light-font-style:inherit;--shiki-dark:#FF5874;--shiki-dark-font-style:italic"> null</span></span>
<span class="line"></span>
<span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> a</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-light-font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> number</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span style="color:#B56959;--shiki-dark:#ECC48D">1</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">\`\`\`</span></span></code></pre> <div class="svp-code-block--lang">md</div> <!></div></div> <h2>Queries</h2> <div class="svp-code-block-wrapper"><div class="svp-code-block"><pre class="shiki shiki-themes vitesse-light night-owl" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">\`\`\`</span><span style="color:#393A34;--shiki-dark:#D6DEEB">ts</span></span>
<span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> hi</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span style="color:#B56959;--shiki-dark:#ECC48D">Hello</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span></span>
<span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> msg</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#B5695977;--shiki-dark:#D6DEEB"> \`</span><span style="color:#1E754F;--shiki-dark:#D3423E">$&#123;</span><span style="color:#B56959;--shiki-light-font-style:inherit;--shiki-dark:#D6DEEB;--shiki-dark-font-style:italic">hi</span><span style="color:#1E754F;--shiki-dark:#D3423E">&#125;</span><span style="color:#B56959;--shiki-light-font-style:inherit;--shiki-dark:#ECC48D;--shiki-dark-font-style:italic">, world</span><span style="color:#B5695977;--shiki-dark:#D6DEEB">\`</span></span>
<span class="line"><span style="color:#A0ADA0;--shiki-light-font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic">//    ^?</span></span>
<span class="line"><span style="color:#A0ADA0;--shiki-light-font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic">//</span></span>
<span class="line"><span style="color:#A0ADA0;--shiki-light-font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic">//</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">\`\`\`</span></span></code></pre> <div class="svp-code-block--lang">md</div> <!></div></div> <h2>Cut codes</h2> <h3>Cut before</h3> <p>use <code></code> or <code></code> can cut all codes before this line</p> <div class="svp-code-block-wrapper"><div class="svp-code-block"><pre class="shiki shiki-themes vitesse-light night-owl" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">\`\`\`</span><span style="color:#393A34;--shiki-dark:#D6DEEB">ts</span></span>
<span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> level</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-light-font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> string</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span style="color:#B56959;--shiki-dark:#ECC48D">Danger</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span></span>
<span class="line"><span style="color:#A0ADA0;--shiki-light-font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic">// ---cut---</span></span>
<span class="line"><span style="color:#B07D48;--shiki-dark:#D6DEEB">console</span><span style="color:#999999;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">.</span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic">log</span><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span style="color:#B07D48;--shiki-dark:#D6DEEB">level</span><span style="color:#999999;--shiki-dark:#D6DEEB">)</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">\`\`\`</span></span></code></pre> <div class="svp-code-block--lang">md</div> <!></div></div> <h3>Cut after</h3> <p>use <code></code> can cut all codes after this line</p> <div class="svp-code-block-wrapper"><div class="svp-code-block"><pre class="shiki shiki-themes vitesse-light night-owl" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">\`\`\`</span><span style="color:#393A34;--shiki-dark:#D6DEEB">ts</span></span>
<span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> level</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-light-font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> string</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span style="color:#B56959;--shiki-dark:#ECC48D">Danger</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span></span>
<span class="line"><span style="color:#A0ADA0;--shiki-light-font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic">// ---cut-before---</span></span>
<span class="line"><span style="color:#B07D48;--shiki-dark:#D6DEEB">console</span><span style="color:#999999;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">.</span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic">log</span><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span style="color:#B07D48;--shiki-dark:#D6DEEB">level</span><span style="color:#999999;--shiki-dark:#D6DEEB">)</span></span>
<span class="line"><span style="color:#A0ADA0;--shiki-light-font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic">// ---cut-after---</span></span>
<span class="line"><span style="color:#B07D48;--shiki-dark:#D6DEEB">console</span><span style="color:#999999;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">.</span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic">log</span><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span><span style="color:#B56959;--shiki-dark:#ECC48D">This is not shown</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span><span style="color:#999999;--shiki-dark:#D6DEEB">)</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">\`\`\`</span></span></code></pre> <div class="svp-code-block--lang">md</div> <!></div></div> <h3>Cut start/end</h3> <p>use <code></code> and <code></code> to cut contents between them</p> <div class="svp-code-block-wrapper"><div class="svp-code-block"><pre class="shiki shiki-themes vitesse-light night-owl" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">\`\`\`</span><span style="color:#393A34;--shiki-dark:#D6DEEB">ts</span></span>
<span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">const</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"> level</span><span style="color:#999999;--shiki-dark:#7FDBCA">:</span><span style="color:#2E8F82;--shiki-light-font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> string</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span style="color:#B56959;--shiki-dark:#ECC48D">Danger</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span></span>
<span class="line"><span style="color:#A0ADA0;--shiki-light-font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic">// ---cut-start---</span></span>
<span class="line"><span style="color:#B07D48;--shiki-dark:#D6DEEB">console</span><span style="color:#999999;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">.</span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic">log</span><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span style="color:#B07D48;--shiki-dark:#D6DEEB">level</span><span style="color:#999999;--shiki-dark:#D6DEEB">)</span><span style="color:#A0ADA0;--shiki-light-font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic"> // This is not shown.</span></span>
<span class="line"><span style="color:#A0ADA0;--shiki-light-font-style:inherit;--shiki-dark:#637777;--shiki-dark-font-style:italic">// ---cut-end---</span></span>
<span class="line"><span style="color:#B07D48;--shiki-dark:#D6DEEB">console</span><span style="color:#999999;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">.</span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic">log</span><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span><span style="color:#B56959;--shiki-dark:#ECC48D">This is shown</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span><span style="color:#999999;--shiki-dark:#D6DEEB">)</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">\`\`\`</span></span></code></pre> <div class="svp-code-block--lang">md</div> <!></div></div> <h2>Twoslash for svelte</h2> <div class="svp-code-block-wrapper"><div class="svp-code-block"><pre class="shiki shiki-themes vitesse-light night-owl twoslash lsp" style="background-color:#ffffff;--shiki-dark-bg:#011627;color:#393a34;--shiki-dark:#d6deeb" tabindex="0"><code><span class="line"><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;</span><span style="color:#1E754F;--shiki-dark:#CAECE6">script</span><span style="color:#999999;--shiki-dark:#7FDBCA">></span></span>
<span class="line"><span style="color:#1E754F;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic">  import</span><span style="color:#999999;--shiki-dark:#D6DEEB"> &#123;</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"> </span><span style="color:#B07D48;--shiki-dark:#D6DEEB"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB"> &#125;</span><span style="color:#1E754F;--shiki-light-font-style:inherit;--shiki-dark:#C792EA;--shiki-dark-font-style:italic"> from</span><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span style="color:#B56959;--shiki-dark:#ECC48D">svelte</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span></span>
<span class="line"></span>
<span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">  let</span><span style="color:#999999;--shiki-dark:#C792EA"> &#123;</span><span style="color:#B07D48;--shiki-dark:#D7DBE0"> </span><span style="color:#B07D48;--shiki-dark:#D7DBE0"><!></span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#B5695977;--shiki-dark:#D9F5DD"> '</span><span style="color:#B56959;--shiki-dark:#ECC48D">World</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">'</span><span style="color:#999999;--shiki-dark:#C792EA"> &#125;</span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#999999;--shiki-dark:#C792EA"> </span><span style="color:#999999;--shiki-dark:#C792EA"><!></span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB">()</span></span>
<span class="line"></span>
<span class="line"><span style="color:#AB5959;--shiki-dark:#C792EA">  let</span><span style="color:#B07D48;--shiki-dark:#D7DBE0"> </span><span style="color:#B07D48;--shiki-dark:#D7DBE0"><!></span><span style="color:#999999;--shiki-dark:#C792EA"> =</span><span style="color:#999999;--shiki-dark:#C792EA"> </span><span style="color:#999999;--shiki-dark:#C792EA"><!></span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span style="color:#2F798A;--shiki-dark:#F78C6C">0</span><span style="color:#999999;--shiki-dark:#D6DEEB">)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic">  </span><span style="color:#59873A;--shiki-light-font-style:inherit;--shiki-dark:#82AAFF;--shiki-dark-font-style:italic"><!></span><span style="color:#999999;--shiki-dark:#D6DEEB">(</span><span style="color:#999999;--shiki-dark:#D9F5DD">()</span><span style="color:#999999;--shiki-dark:#C792EA"> =></span><span style="color:#999999;--shiki-dark:#D6DEEB"> &#123;</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#D6DEEB">  &#125;)</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;/</span><span style="color:#1E754F;--shiki-dark:#CAECE6">script</span><span style="color:#999999;--shiki-dark:#7FDBCA">></span></span>
<span class="line"></span>
<span class="line"><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;</span><span style="color:#1E754F;--shiki-dark:#CAECE6">button</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> onclick</span><span style="color:#999999;--shiki-dark:#7FDBCA">=</span><span style="color:#999999;--shiki-dark:#D3423E">&#123;</span><span style="color:#999999;--shiki-dark:#D9F5DD">()</span><span style="color:#999999;--shiki-dark:#C792EA"> =></span><span style="color:#B07D48;--shiki-dark:#D6DEEB"> </span><span style="color:#B07D48;--shiki-dark:#D6DEEB"><!></span><span style="color:#AB5959;--shiki-dark:#C792EA">++</span><span style="color:#999999;--shiki-dark:#D3423E">&#125;</span><span style="color:#999999;--shiki-dark:#7FDBCA">></span></span>
<span class="line"><span style="color:#393A34;--shiki-dark:#D6DEEB">  Count is: </span><span style="color:#999999;--shiki-dark:#D3423E">&#123;</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"><!></span><span style="color:#999999;--shiki-dark:#D3423E">&#125;</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;/</span><span style="color:#1E754F;--shiki-dark:#CAECE6">button</span><span style="color:#999999;--shiki-dark:#7FDBCA">></span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;</span><span style="color:#1E754F;--shiki-dark:#CAECE6">div</span><span style="color:#B07D48;--shiki-light-font-style:inherit;--shiki-dark:#C5E478;--shiki-dark-font-style:italic"> class</span><span style="color:#999999;--shiki-dark:#7FDBCA">=</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">"</span><span style="color:#B56959;--shiki-dark:#ECC48D">text-6</span><span style="color:#B5695977;--shiki-dark:#D9F5DD">"</span><span style="color:#999999;--shiki-dark:#7FDBCA">></span></span>
<span class="line"><span style="color:#393A34;--shiki-dark:#D6DEEB">  Hello, </span><span style="color:#999999;--shiki-dark:#D3423E">&#123;</span><span style="color:#B07D48;--shiki-dark:#D6DEEB"><!></span><span style="color:#999999;--shiki-dark:#D3423E">&#125;</span></span>
<span class="line"><span style="color:#999999;--shiki-dark:#7FDBCA">&#x3C;/</span><span style="color:#1E754F;--shiki-dark:#CAECE6">div</span><span style="color:#999999;--shiki-dark:#7FDBCA">></span></span></code></pre> <div class="svp-code-block--lang">svelte</div> <!></div></div>`,
	1
);

export default function Real_world($$anchor) {
	var fragment = root_28();
	var ul = $.sibling($.first_child(fragment), 10);
	var li = $.child(ul);
	var code = $.sibling($.child(li));

	code.textContent = 'highlighter.twoslash';

	var code_1 = $.sibling(code, 2);

	code_1.textContent = 'true';
	$.reset(li);
	$.reset(ul);

	var div = $.sibling(ul, 2);
	var div_1 = $.sibling($.child(div), 2);
	var pre = $.sibling($.child(div_1), 6);
	var code_2 = $.child(pre);
	var span = $.child(code_2);
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

	var span_4 = $.sibling(span, 2);
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
	$.next(5);
	$.reset(span_4);

	var span_8 = $.sibling(span_4, 2);
	var span_9 = $.sibling($.child(span_8), 3);
	var node_2 = $.child(span_9);

	{
		const floatingContent = ($$anchor) => {
			var span_10 = root_4();

			$.append($$anchor, span_10);
		};

		Floating(node_2, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_11 = root_5();

				$.append($$anchor, span_11);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_9);
	$.next(5);
	$.reset(span_8);

	var span_12 = $.sibling(span_8, 4);
	var span_13 = $.sibling($.child(span_12), 3);
	var node_3 = $.child(span_13);

	{
		const floatingContent = ($$anchor) => {
			var span_14 = root_4();

			$.append($$anchor, span_14);
		};

		Floating(node_3, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_15 = root_5();

				$.append($$anchor, span_15);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_13);
	$.next();
	$.reset(span_12);

	var span_16 = $.sibling(span_12, 2);
	var span_17 = $.sibling($.child(span_16));
	var node_4 = $.child(span_17);

	{
		const floatingContent = ($$anchor) => {
			var span_18 = root_6();

			$.append($$anchor, span_18);
		};

		Floating(node_4, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_19 = root_7();

				$.append($$anchor, span_19);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_17);
	$.next();
	$.reset(span_16);

	var span_20 = $.sibling(span_16, 2);
	var span_21 = $.sibling($.child(span_20));
	var node_5 = $.child(span_21);

	{
		const floatingContent = ($$anchor) => {
			var span_22 = root_8();

			$.append($$anchor, span_22);
		};

		Floating(node_5, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_23 = root_3();

				$.append($$anchor, span_23);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_21);
	$.next();
	$.reset(span_20);

	var span_24 = $.sibling(span_20, 2);
	var span_25 = $.sibling($.child(span_24));
	var node_6 = $.child(span_25);

	{
		const floatingContent = ($$anchor) => {
			var span_26 = root_9();

			$.append($$anchor, span_26);
		};

		Floating(node_6, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_27 = root_10();

				$.append($$anchor, span_27);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_25);

	var span_28 = $.sibling(span_25, 2);
	var node_7 = $.child(span_28);

	{
		const floatingContent = ($$anchor) => {
			var span_29 = root_11();

			$.append($$anchor, span_29);
		};

		Floating(node_7, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_30 = root_1();

				$.append($$anchor, span_30);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_28);
	$.next();
	$.reset(span_24);

	var span_31 = $.sibling(span_24, 2);
	var span_32 = $.sibling($.child(span_31));
	var node_8 = $.child(span_32);

	{
		const floatingContent = ($$anchor) => {
			var span_33 = root_12();

			$.append($$anchor, span_33);
		};

		Floating(node_8, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_34 = root_13();

				$.append($$anchor, span_34);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_32);
	$.next();
	$.reset(span_31);

	var span_35 = $.sibling(span_31, 2);
	var span_36 = $.sibling($.child(span_35));
	var node_9 = $.child(span_36);

	{
		const floatingContent = ($$anchor) => {
			var span_37 = root_14();

			$.append($$anchor, span_37);
		};

		Floating(node_9, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_38 = root_15();

				$.append($$anchor, span_38);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_36);
	$.next(3);
	$.reset(span_35);
	$.next(10);
	$.reset(code_2);
	$.reset(pre);

	var node_10 = $.sibling(pre, 4);

	CopyCode(node_10, {});
	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 4);
	var div_3 = $.child(div_2);
	var node_11 = $.sibling($.child(div_3), 4);

	CopyCode(node_11, {});
	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 4);
	var div_5 = $.child(div_4);
	var node_12 = $.sibling($.child(div_5), 4);

	CopyCode(node_12, {});
	$.reset(div_5);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 4);
	var div_7 = $.child(div_6);
	var node_13 = $.sibling($.child(div_7), 4);

	CopyCode(node_13, {});
	$.reset(div_7);
	$.reset(div_6);

	var p = $.sibling(div_6, 6);
	var code_3 = $.sibling($.child(p));

	code_3.textContent = '// ---cut---';

	var code_4 = $.sibling(code_3, 2);

	code_4.textContent = '// ---cut-before---';
	$.next();
	$.reset(p);

	var div_8 = $.sibling(p, 2);
	var div_9 = $.child(div_8);
	var node_14 = $.sibling($.child(div_9), 4);

	CopyCode(node_14, {});
	$.reset(div_9);
	$.reset(div_8);

	var p_1 = $.sibling(div_8, 4);
	var code_5 = $.sibling($.child(p_1));

	code_5.textContent = '// ---cut-after---';
	$.next();
	$.reset(p_1);

	var div_10 = $.sibling(p_1, 2);
	var div_11 = $.child(div_10);
	var node_15 = $.sibling($.child(div_11), 4);

	CopyCode(node_15, {});
	$.reset(div_11);
	$.reset(div_10);

	var p_2 = $.sibling(div_10, 4);
	var code_6 = $.sibling($.child(p_2));

	code_6.textContent = '// ---cut-start---';

	var code_7 = $.sibling(code_6, 2);

	code_7.textContent = '// ---cut-end---';
	$.next();
	$.reset(p_2);

	var div_12 = $.sibling(p_2, 2);
	var div_13 = $.child(div_12);
	var node_16 = $.sibling($.child(div_13), 4);

	CopyCode(node_16, {});
	$.reset(div_13);
	$.reset(div_12);

	var div_14 = $.sibling(div_12, 4);
	var div_15 = $.child(div_14);
	var pre_1 = $.child(div_15);
	var code_8 = $.child(pre_1);
	var span_39 = $.sibling($.child(code_8), 2);
	var span_40 = $.sibling($.child(span_39), 3);
	var node_17 = $.child(span_40);

	{
		const floatingContent = ($$anchor) => {
			var span_41 = root_16();

			$.append($$anchor, span_41);
		};

		Floating(node_17, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_42 = root_17();

				$.append($$anchor, span_42);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_40);
	$.next(5);
	$.reset(span_39);

	var span_43 = $.sibling(span_39, 4);
	var span_44 = $.sibling($.child(span_43), 3);
	var node_18 = $.child(span_44);

	{
		const floatingContent = ($$anchor) => {
			var span_45 = root_18();

			$.append($$anchor, span_45);
		};

		Floating(node_18, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_46 = root_19();

				$.append($$anchor, span_46);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_44);

	var span_47 = $.sibling(span_44, 8);
	var node_19 = $.child(span_47);

	{
		const floatingContent = ($$anchor) => {
			var span_48 = root_20();

			$.append($$anchor, span_48);
		};

		Floating(node_19, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_49 = root_21();

				$.append($$anchor, span_49);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_47);

	var span_50 = $.sibling(span_47);
	var node_20 = $.child(span_50);

	{
		const floatingContent = ($$anchor) => {
			var span_51 = root_20();

			$.append($$anchor, span_51);
		};

		Floating(node_20, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_52 = root_22();

				$.append($$anchor, span_52);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_50);
	$.next();
	$.reset(span_43);

	var span_53 = $.sibling(span_43, 4);
	var span_54 = $.sibling($.child(span_53), 2);
	var node_21 = $.child(span_54);

	{
		const floatingContent = ($$anchor) => {
			var span_55 = root_23();

			$.append($$anchor, span_55);
		};

		Floating(node_21, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_56 = root_24();

				$.append($$anchor, span_56);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_54);

	var span_57 = $.sibling(span_54, 3);
	var node_22 = $.child(span_57);

	{
		const floatingContent = ($$anchor) => {
			var span_58 = root_25();

			$.append($$anchor, span_58);
		};

		Floating(node_22, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_59 = root_21();

				$.append($$anchor, span_59);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_57);

	var span_60 = $.sibling(span_57);
	var node_23 = $.child(span_60);

	{
		const floatingContent = ($$anchor) => {
			var span_61 = root_25();

			$.append($$anchor, span_61);
		};

		Floating(node_23, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_62 = root_26();

				$.append($$anchor, span_62);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_60);
	$.next(3);
	$.reset(span_53);

	var span_63 = $.sibling(span_53, 4);
	var span_64 = $.sibling($.child(span_63));
	var node_24 = $.child(span_64);

	{
		const floatingContent = ($$anchor) => {
			var span_65 = root_27();

			$.append($$anchor, span_65);
		};

		Floating(node_24, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_66 = root_17();

				$.append($$anchor, span_66);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_64);
	$.next(4);
	$.reset(span_63);

	var span_67 = $.sibling(span_63, 8);
	var span_68 = $.sibling($.child(span_67), 8);
	var node_25 = $.child(span_68);

	{
		const floatingContent = ($$anchor) => {
			var span_69 = root_23();

			$.append($$anchor, span_69);
		};

		Floating(node_25, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_70 = root_24();

				$.append($$anchor, span_70);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_68);
	$.next(3);
	$.reset(span_67);

	var span_71 = $.sibling(span_67, 2);
	var span_72 = $.sibling($.child(span_71), 2);
	var node_26 = $.child(span_72);

	{
		const floatingContent = ($$anchor) => {
			var span_73 = root_23();

			$.append($$anchor, span_73);
		};

		Floating(node_26, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_74 = root_24();

				$.append($$anchor, span_74);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_72);
	$.next();
	$.reset(span_71);

	var span_75 = $.sibling(span_71, 6);
	var span_76 = $.sibling($.child(span_75), 2);
	var node_27 = $.child(span_76);

	{
		const floatingContent = ($$anchor) => {
			var span_77 = root_18();

			$.append($$anchor, span_77);
		};

		Floating(node_27, {
			class: 'twoslash-hover',
			floatingContent,
			children: ($$anchor, $$slotProps) => {
				var span_78 = root_19();

				$.append($$anchor, span_78);
			},
			$$slots: { floatingContent: true, default: true }
		});
	}

	$.reset(span_76);
	$.next();
	$.reset(span_75);
	$.next(2);
	$.reset(code_8);
	$.reset(pre_1);

	var node_28 = $.sibling(pre_1, 4);

	CopyCode(node_28, {});
	$.reset(div_15);
	$.reset(div_14);
	$.append($$anchor, fragment);
}