import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>action</button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const obj = {
		deep: {
			foo: 'bar',
			action(element, { leet }) {
				element.foo = this.foo + leet;
			}
		}
	};

	var button = root();

	$.action(button, ($$node, $$action_arg) => obj.deep.action?.($$node, $$action_arg), () => ({ leet: 1337 }));
	$.append($$anchor, button);
	$.pop();
}