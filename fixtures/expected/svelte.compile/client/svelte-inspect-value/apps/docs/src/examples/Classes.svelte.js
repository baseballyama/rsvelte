import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Inspect } from '@components';

export default function Classes($$anchor, $$props) {
	$.push($$props, true);

	const cls = eval(`(class Greeter {
    static staticProperty = 'Hello'

    constructor(name) {
      this.name = name;
    }

    greet() {
      return 'Hello' + ' ' + this.name
    }
  
  })`);

	{
		let $0 = $.derived(() => ({ class: cls, classInstance: new cls('name') }));

		Inspect($$anchor, {
			get values() {
				return $.get($0);
			}
		});
	}

	$.pop();
}