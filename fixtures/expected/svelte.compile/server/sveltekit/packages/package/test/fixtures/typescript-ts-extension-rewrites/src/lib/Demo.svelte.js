import * as $ from 'svelte/internal/server';
import { helper } from '#lib/helper.ts';
import { helper2 } from './helper2.ts';

export default function Demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<!---->${$.escape(helper())}${$.escape(helper2())} <pre>import.meta.glob('./helper*.ts')</pre>`);
	});
}