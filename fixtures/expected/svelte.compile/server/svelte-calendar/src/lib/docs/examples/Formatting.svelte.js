import * as $ from 'svelte/internal/server';
import { Datepicker } from '../../index';

export default function Formatting($$renderer) {
	let format = 'dddd, MMMM D, YYYY';

	Datepicker($$renderer, { format });
	$$renderer.push(`<!----> <input type="text"${$.attr('value', format)} class="svelte-vh5avo"/> <p>See <a href="https://day.js.org/docs/en/display/format">dayjs</a> documentation for formatting docs</p>`);
}