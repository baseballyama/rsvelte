import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Code from "docs/Code.svelte";

var root = $.from_html(
	`<h2>Hi</h2> <p class="pb-4">Smelte is a UI framework built on top of Svelte and <a class="a" href="https://tailwindcss.com">Tailwind CSS</a> using Material Design spec. It comes with many components and utility
  functions making it easy to build beautiful responsive layouts while keeping
  bundle size and performance at check all thanks to Svelte. The project was
  initially inspired by <a class="a" href="https://vuetifyjs.com">Vuetify,</a> but comes at much lower price. The website you're viewing is only a fraction
  of both JS (670 vs 40 Kb) and CSS (110 vs 10 Kb) payloads of even the most <a class="a" href="https://vuetifyjs.com/en/examples/layouts/baseline">basic Vuetify example layout)</a> , and of course has <a class="a" href="dark-mode">dark mode.</a></p> <p class="pb-4">Tailwind resets much of CSS whereas Smelte tries to bring sensible Material
  design defaults in <a class="a" href="/typography">typography</a> and <a class="a" href="/color">color.</a></p> <p>Hit up the components <a class="a" href="/components">introduction</a> or please join our <a class="a" href="https://discord.com/invite/nZc64MMdkU">Discord chat</a> for a lovely chat!</p> <h4 id="installation" class="mt-8 pb-4">Installation</h4> To get you started you need to add Smelte to your dependencies with your
favorite package manager. <!> Then add the Smelte Rollup plugin (after svelte but before css). Webpack support
coming soon. <!> Then you should add Tailwind utilites CSS in your app component. <!> You might also need to include material icons in your template's if you use any: <!> Or ship them along with Roboto if you would like to use default material font: <!> And you're good to go and have all the Tailwind CSS power all to yourself! For
treeshaking to work it is recommended to import each component on its own like
this: <!>`,
	1
);

export default function Routes($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 10);

	Code(node, { code: '$ npm install smelte or yarn add smelte' });

	var node_1 = $.sibling(node, 2);

	Code(node_1, {
		code: `const smelte=require("smelte/rollup-plugin-smelte");

plugins=[ 
  ...your plugins, 
  smelte({ 
    purge: production,
    output: "public/global.css", // it defaults to static/global.css which is probably what you expect in Sapper 
    postcss: [], // Your PostCSS plugins
    whitelist: [], // Array of classnames whitelisted from purging
    whitelistPatterns: [], // Same as above, but list of regexes
    tailwind: { 
      colors: { 
        primary: "#b027b0",
        secondary: "#009688",
        error: "#f44336",
        success: "#4caf50",
        alert: "#ff9800",
        blue: "#2196f3",
        dark: "#212121" 
      }, // Object of colors to generate a palette from, and then all the utility classes
      darkMode: true, 
    }, 
    // Any other props will be applied on top of default Smelte tailwind.config.js
  }),
]`
	});

	var node_2 = $.sibling(node_1, 2);

	Code(node_2, { code: `import "smelte/src/tailwind.css" ;` });

	var node_3 = $.sibling(node_2, 2);

	Code(node_3, {
		code: `<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">`
	});

	var node_4 = $.sibling(node_3, 2);

	Code(node_4, {
		code: `<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500|Material+Icons&display=swap"
    rel="stylesheet" />`
	});

	var node_5 = $.sibling(node_4, 2);

	Code(node_5, {
		code: `import Button from "smelte/src/components/Button";
import Treeview from "smelte/src/components/Treeview";`
	});

	$.append($$anchor, fragment);
}