import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { helper } from '#lib/helper.ts';
import { helper2 } from './helper2.ts';

var root = $.from_html(` <pre>import.meta.glob('./helper*.ts')</pre>`, 1);

export default function Demo($$anchor, $$props) {
	$.push($$props, true);
	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	$.next();
	$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''}${$1 ?? ''} `), [() => helper(), () => helper2()]);
	$.append($$anchor, fragment);
	$.pop();
}