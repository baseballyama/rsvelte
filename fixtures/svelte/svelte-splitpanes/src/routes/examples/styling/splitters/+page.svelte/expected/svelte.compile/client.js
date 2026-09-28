import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Highlighted from '$comp/Highlighted.svelte';
import ExampleArea from '$comp/ExampleArea.svelte';
import example from './code.svelte?example';
import defaultTheme from 'svelte-splitpanes/internal/default-theme.scss?example';

var root = $.from_html(
	`<h2>Styling Splitters</h2> <p>Styling splitters is fully customizable using CSS (or SCSS), the \`theme\` property is used to
  select the proper styling class and apply it to the Splitpanes component. <br/> The default style is called \`default-theme\`, its SCSS definition can be found below ( <b>warning</b> : This is for reference only! If you decide to copy this CSS code, you must rename the ".default-theme"
  specifier to something else, so it wouldn't conflict the library theme CSS definition):</p> <!> <p>Alternatively, here is the default theme compiled to CSS:</p> <!> <p>By altering the above styles, it is possible to achieve neat visual adjustments. Please note how
  each Splitpanes references our new \`theme="my-theme"\`</p> <!>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	Highlighted(node, {
		lang: 'scss',
		get highlighted() {
			return defaultTheme.highlightedHTML;
		}
	});

	var node_1 = $.sibling(node, 4);

	Highlighted(node_1, {
		lang: 'scss',
		get highlighted() {
			return defaultTheme.cssHighlightedHTML;
		}
	});

	var node_2 = $.sibling(node_1, 4);

	ExampleArea(node_2, {
		get example() {
			return example;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}