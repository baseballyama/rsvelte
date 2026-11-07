import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="flex col"><h3 id="classes">Classes</h3> <p>Display "static" properties of classes</p> <!></div>`);

export default function Classes($$anchor, $$props) {
	$.push($$props, true);

	class Greeter {
		static staticProperty = 'HI';

		static get something() {
			return 'something';
		}

		iHaveAProperty = 'hello';
		name;

		constructor(name) {
			this.name = name;
		}

		// eslint-disable-next-line no-console
		greet = () => console.log(`${Greeter.staticProperty} ${this.name}`);

		method() {
			return 'hei';
		}

		toString() {
			return 'nonononono';
		}
	}

	getContext('toc')?.set('Classes', 'classes');

	var div = root();
	var node = $.sibling($.child(div), 4);

	$.component(node, () => Inspect.Values.Expand0, ($$anchor, Inspect_Values_Expand0) => {
		Inspect_Values_Expand0($$anchor, $.spread_props(() => ({ class: Greeter, classInstance: new Greeter('world') })));
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}