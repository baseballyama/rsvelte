import * as $ from 'svelte/internal/server';
import { scrollPos } from './scrollPos';

export default function Trigger($$renderer, $$props) {
	var $$store_subs;
	let { in: _in, out: _out, children, fallback } = $$props;

	if ((_in === undefined || $.store_get($$store_subs ??= {}, '$scrollPos', scrollPos) > _in) && (_out === undefined || $.store_get($$store_subs ??= {}, '$scrollPos', scrollPos) < _out)) {
		$$renderer.push('<!--[0-->');
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
		fallback?.($$renderer);
		$$renderer.push(`<!---->`);
	}

	$$renderer.push(`<!--]-->`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}