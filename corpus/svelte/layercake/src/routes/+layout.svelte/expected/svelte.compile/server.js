import * as $ from 'svelte/internal/server';
import '../app.css';
import '../hljs.css';
import Nav from './_site-components/Nav.svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;

		Nav($$renderer, { sections: data.sections });
		$$renderer.push(`<!----> <main>`);
		children?.($$renderer);
		$$renderer.push(`<!----></main>`);
	});
}