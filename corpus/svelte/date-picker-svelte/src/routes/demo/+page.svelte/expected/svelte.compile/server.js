import * as $ from 'svelte/internal/server';
import DemoDatePicker from '../DemoDatePicker.svelte';
import DemoDateInput from '../DemoDateInput.svelte';

export default function _page($$renderer) {
	$.head('1du1zi4', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Demo • Date Picker Svelte</title>`);
		});
	});

	$$renderer.push(`<a id="Demo"></a> <h1>Demo</h1> <a id="DateInput"></a> <h2>DateInput</h2> `);
	DemoDateInput($$renderer, {});
	$$renderer.push(`<!----> <a id="DatePicker"></a> <h2>DatePicker</h2> `);
	DemoDatePicker($$renderer, {});
	$$renderer.push(`<!---->`);
}