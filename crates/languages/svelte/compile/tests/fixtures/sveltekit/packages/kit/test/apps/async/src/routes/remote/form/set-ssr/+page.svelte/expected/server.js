import * as $ from 'svelte/internal/server';
import { editData } from './form.remote';

export default function _page($$renderer) {
	const form = editData;

	form.fields.set({ description: 'ssr' });
	form.fields.description.set('nested');
	$$renderer.push(`<div id="description">Description: ${$.escape(form.fields.description.value())}</div> <form${$.attributes({ ...form })}><input${$.attributes({ ...form.fields.name.as('text') }, void 0, void 0, void 0, 4)}/> <button type="submit">Submit</button></form>`);
}