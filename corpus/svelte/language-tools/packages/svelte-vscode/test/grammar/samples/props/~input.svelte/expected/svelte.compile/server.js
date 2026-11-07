import * as $ from 'svelte/internal/server';

export default function Input_1($$renderer) {
	$$renderer.push(`<input value="1"/> <input${$.attr('value', 1)}/> <input${$.attr('value', value)}/> <input${$.attr('value', 1)}/> <input type="number" min="0"/> <div tabindex="1"></div> <div${$.attr('tabindex', 1)}></div> <div${$.attr('tabindex', tabindex)}></div> <div${$.attr('tabindex', tabindex)}></div> <div${$.attr('tabindex', 1)}></div> `);
	Input($$renderer, { value: '1' });
	$$renderer.push(`<!----> `);
	Input($$renderer, { value: 1 });
	$$renderer.push(`<!----> `);
	Input($$renderer, { value });

	$$renderer.push(`<!----> <div title="Really?
    Yes"></div> `);

	Input($$renderer, { hi_hi: false, 'hi-hi': '' });
	$$renderer.push(`<!---->`);
}