import * as $ from 'svelte/internal/server';
import { helper } from './helper.js';
import { helper2 } from './helper2.js';

export default function Demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<!---->${$.escape(helper())}${$.escape(helper2())} <pre>import.meta.glob('./helper*.ts')</pre>`);
	});
}