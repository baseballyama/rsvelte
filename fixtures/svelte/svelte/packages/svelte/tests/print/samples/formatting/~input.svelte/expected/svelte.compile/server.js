import * as $ from 'svelte/internal/server';
import { setLocale } from '$lib/paraglide/runtime';
import { m } from '$lib/paraglide/messages.js';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>${$.escape(m.hello_world({ name: 'SvelteKit User' }))}</h1><div><button>en</button><button>es</button></div><p>If you use VSCode, install the <a href="https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension" target="_blank">Sherlock i18n extension</a>for a better i18n experience.</p> `);

		Component($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div><button>Hello, this is a test</button><button>Hello, this is a test</button></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Component($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<button>Hello, this is a test</button><button>Hello, this is a test</button>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <button class="foo bar" aria-label="click">Click me!</button> <button class="foo bar" aria-label="click"><span>some fancy looking</span><span>really long button text</span></button>`);
	});
}