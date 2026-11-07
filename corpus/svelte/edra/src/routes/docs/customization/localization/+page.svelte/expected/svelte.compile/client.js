import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { ArrowLeft } from '@lucide/svelte';
import Code from '$lib/components/custom/docs/Code.svelte';

var root = $.from_html(`<!> Back to Customization`, 1);

var root_1 = $.from_html(`<article class="prose dark:prose-invert max-w-none"><h1>Localization & Multi-Language</h1> <p class="lead">Edra centralizes all text, placeholders, and UI labels into a single configuration file, making
		it incredibly easy to translate or connect to your existing i18n solution.</p> <hr class="my-6"/> <h2>The strings.ts file</h2> <p>When you install Edra via the registry, a file named <code>src/lib/edra/strings.ts</code> is added
		to your project. This file contains a plain JavaScript object mapping all the text used throughout
		the editor's UI—including slash commands, tooltips, placeholders, and error messages.</p> <h3>Static Translation</h3> <p>If your application only needs to support one specific language (e.g., Spanish or French), you
		can directly edit this file and translate the strings manually.</p> <div class="my-4"><!></div> <hr class="my-6"/> <h2>Integrating with i18n Libraries</h2> <p>If you are building a multi-language application using tools like <code>inlang/paraglide-js</code>, <code>svelte-i18n</code>, or <code>typesafe-i18n</code>, you can easily wire them up to Edra.</p> <p>Since Svelte 5 and many modern i18n tools support reactive functions or stores, you can use
		JavaScript getters to dynamically return the translated strings. This ensures that when the user
		switches their language, the editor's UI updates reactively.</p> <div class="my-4"><!></div> <div class="mt-12 flex"><!></div></article>`);

export default function _page($$anchor) {
	const staticExample = `// src/lib/edra/strings.ts
export default {
	command: {
		undo: 'Deshacer',
		redo: 'Rehacer',
		h1: 'Encabezado 1',
		// ...
	},
	// ...
};`;

	const i18nExample = `// src/lib/edra/strings.ts
import { m } from '$lib/i18n/messages.js'; // Example using paraglide-js

// You can replace static strings with reactive functions or getters
// depending on your i18n library.
export default {
	command: {
		get undo() { return m.undo() },
		get redo() { return m.redo() },
		get h1() { return m.h1() },
	},
	// ...
};`;

	var article = root_1();

	$.head('1nozgm0', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Localization & Strings | Edra Docs';
		});
	});

	var div = $.sibling($.child(article), 14);
	var node = $.child(div);

	Code(node, { code: staticExample, language: 'ts' });
	$.reset(div);

	var div_1 = $.sibling(div, 10);
	var node_1 = $.child(div_1);

	Code(node_1, { code: i18nExample, language: 'ts' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	Button(node_2, {
		href: '/docs/customization',
		variant: 'outline',
		class: 'gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_3 = $.first_child(fragment);

			ArrowLeft(node_3, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(article);
	$.append($$anchor, article);
}