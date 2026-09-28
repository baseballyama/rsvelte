import * as $ from 'svelte/internal/server';
import { Inspect } from '@components';

export default function Classes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const cls = eval(`(class Greeter {
    static staticProperty = 'Hello'

    constructor(name) {
      this.name = name;
    }

    greet() {
      return 'Hello' + ' ' + this.name
    }
  
  })`);

		Inspect($$renderer, { values: { class: cls, classInstance: new cls('name') } });
	});
}