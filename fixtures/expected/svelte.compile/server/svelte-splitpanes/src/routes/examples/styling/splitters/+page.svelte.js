import * as $ from 'svelte/internal/server';
import Highlighted from '$comp/Highlighted.svelte';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';
import defaultTheme from 'svelte-splitpanes/internal/default-theme.scss?example';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h2>Styling Splitters</h2> <p>Styling splitters is fully customizable using CSS (or SCSS), the \`theme\` property is used to
  select the proper styling class and apply it to the Splitpanes component. <br/> The default style is called \`default-theme\`, its SCSS definition can be found below ( <b>warning</b> : This is for reference only! If you decide to copy this CSS code, you must rename the ".default-theme"
  specifier to something else, so it wouldn't conflict the library theme CSS definition):</p> `);

		Highlighted($$renderer, { lang: 'scss', highlighted: defaultTheme.highlightedHTML });
		$$renderer.push(`<!----> <p>Alternatively, here is the default theme compiled to CSS:</p> `);
		Highlighted($$renderer, { lang: 'scss', highlighted: defaultTheme.cssHighlightedHTML });

		$$renderer.push(`<!----> <p>By altering the above styles, it is possible to achieve neat visual adjustments. Please note how
  each Splitpanes references our new \`theme="my-theme"\`</p> `);

		ExampleArea($$renderer, { example });
		$$renderer.push(`<!---->`);
	});
}