import * as $ from 'svelte/internal/server';
import Code from "docs/Code.svelte";
import { darkMode } from "dark";

export default function Dark_mode($$renderer) {
	var $$store_subs;

	$$renderer.push(`<h4 class="pb-8">Dark mode</h4> <p>Smelte uses css pseudo-class variant <a class="a" href="https://tailwindcss.com/docs/configuring-variants/">feature</a> of Tailwind to enable dark mode. Basic dark mode switch looks like this:</p> `);

	Code($$renderer, {
		code: `<button bind:value={$darkMode}>Toggle dark mode</button>`
	});

	$$renderer.push(`<!----> <p>This will append <span class="code-inline">mode-dark</span> class to the document body which will enable all generated classes preceded by
  pseudo-class "dark:". By default smelte generates following variants:</p> `);

	Code($$renderer, {
		code: `
backgroundColor: ["dark", "dark-hover", "hover"],
borderColor: ["dark", "dark-focus"],
textColor: ["dark", "dark-hover", "dark-active"]
`
	});

	$$renderer.push(`<!----> <p>Now you can use dark theme classes like <span class="code-inline">dark:bg-white</span> (try using the theme toggle on the top right).</p> <div class="duration-200 ease-in p-10 my-10 bg-black dark:bg-white text-white dark:text-black">I am a ${$.escape($.store_get($$store_subs ??= {}, '$darkMode', darkMode) ? 'dark' : 'light')} div.</div> `);

	Code($$renderer, {
		code: `
<div class="duration-200 ease-in p-10 my-10 bg-black dark:bg-white text-white dark:text-black">
  I am a {$darkMode ? "dark" : "light"} div.
</div>
`
	});

	$$renderer.push(`<!----> <p>If you don't need dark mode at all, you can pass <span class="code-inline">darkMode: false</span> to the smelte-rollup-plugin and it will generate no extra CSS.</p>`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}