import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Kbd } from 'svelte-ux';
import Code from '$lib/components/Code.svelte';

var root = $.from_html(`<div class="prose max-w-none bg-surface-100 rounded border p-4 mt-4 m-2"><h1>Getting started</h1> <h2>Installation</h2> <div class="grid gap-3"><ul class="mt-0"><li>Svelte UX 1.0.0 requires Tailwind 3. For new projects, Svelte CLI <code>sv</code> installs
        Tailwind 4 which can not be used. Instead you will need to follow the <a href="https://v3.tailwindcss.com/docs/guides/sveltekit" target="_blank">official guide</a> to setup your project.</li> <li>The upcoming Svelte UX 2.0.0 release has been updated to Tailwind 4 and can be previewed <a href="https://next.svelte-ux.techniq.dev/" target="_blank">here</a>.</li> <li>Svelte UX 1.0.0 supports Svelte 3-5, while 2.0.0 will require Svelte 5.</li></ul> <div>Add Svelte UX package</div> <!> <div>Update <code>tailwind.config.cjs</code></div> <!></div> <p>A few notes regarding the <code>tailwind.config.cjs</code></p> <ul><li><code></code> adds the library classes via <a href="https://tailwindcss.com/docs/content-configuration">JIT</a></li> <li><code>ux.themes</code> is used to configure the theme colors. See <a href="/customization">customization</a> for more details.</li> <li>Tailwind plugin injects the theme color variables, sets border, outline, ring, and typograpy
      defauls based on the theme, and adds additional utility classes including: <ul><li><code>elevation-#</code> for <a class="text-primary font-medium" href="https://www.joshwcomeau.com/css/designing-shadows/" rel="nofollow">realistic shadows</a> using multiple shadow layers, unlike the current Tailwind <a class="text-primary font-medium" href="https://tailwindcss.com/docs/box-shadow" rel="nofollow">shadows</a> which have at most 2 layers.</li> <li><code>grid-stack</code> to easily stack grid children</li> <li><code>scrollbar-none</code> to hide the scrollbar</li></ul></li></ul> <h2>Usage</h2> <p>Using <code>components</code>, <code>actions</code>, <code>stores</code>, or <code>utils</code> are as simple as importing from <code>svelte-ux</code>.</p> <!> <p>Search docs using <!> or browse using the sidebar navigation.</p></div>`);

export default function _page($$anchor) {
	var div = root();
	var div_1 = $.sibling($.child(div), 4);
	var node = $.sibling($.child(div_1), 4);

	Code(node, { source: `npm install svelte-ux`, language: 'sh' });

	var node_1 = $.sibling(node, 4);

	Code(node_1, {
		source: `const colors = require('tailwindcss/colors');
const layerstack = require('@layerstack/tailwind/plugin');

module.exports = {
  content: [
    './src/**/*.{html,svelte}', 
    './node_modules/svelte-ux/**/*.{svelte,js}'
  ],

  // See customization docs: https://svelte-ux.techniq.dev/customization
  ux: {
    themes: {
      light: {
        primary: colors['orange']['500'],
        'primary-content': 'white',
        secondary: colors['blue']['500'],
        'surface-100': 'white',
        'surface-200': colors['gray']['100'],
        'surface-300': colors['gray']['300'],
        'surface-content': colors['gray']['900'],
        'color-scheme': 'light'
      },
      dark: {
        primary: colors['orange']['500'],
        'primary-content': 'white',
        secondary: colors['blue']['500'],
        'surface-100': colors['zinc']['800'],
        'surface-200': colors['zinc']['900'],
        'surface-300': colors['zinc']['950'],
        'surface-content': colors['zinc']['100'],
        'color-scheme': 'dark'
      },
    },
  },

  plugins: [
    layerstack,  // uses hsl() color space by default. To use oklch(), use: layerstack({ colorSpace: 'oklch' }),
  ]
};`,
		language: 'js'
	});

	$.reset(div_1);

	var ul = $.sibling(div_1, 4);
	var li = $.child(ul);
	var code = $.child(li);

	code.textContent = './node_modules/svelte-ux/**/*.{(svelte, js)}';
	$.next(2);
	$.reset(li);
	$.next(4);
	$.reset(ul);

	var node_2 = $.sibling(ul, 6);

	Code(node_2, {
		source: '<' + `script>
  import { Button } from 'svelte-ux';
</script>

<Button>Click here</Button>`,
		language: 'svelte'
	});

	var p = $.sibling(node_2, 2);
	var node_3 = $.sibling($.child(p));

	Kbd(node_3, {
		command: true,
		class: 'text-xs',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('K');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}