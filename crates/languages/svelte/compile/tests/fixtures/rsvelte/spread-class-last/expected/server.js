import * as $ from 'svelte/internal/server';

import { vmodel, vModelText } from './runtime.js';

export default function Spread_class_last($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { own = 'a', $$slots, $$events, ...rest } = $$props;
		let text = '';
		let attrs = $.derived(() => ({ ...rest, title: text }));
		function onClick() {
			text = '';
		}
		$$renderer.push(`<input${$.attributes({ type: 'text', ...attrs(), class: $.clsx('class' in attrs() ? [own, attrs().class] : own) }, void 0, void 0, void 0, 4)}/> <input type="text"/> <div${$.attributes({ ...attrs() })}>${$.escape(text)}</div>`);
	});
}
