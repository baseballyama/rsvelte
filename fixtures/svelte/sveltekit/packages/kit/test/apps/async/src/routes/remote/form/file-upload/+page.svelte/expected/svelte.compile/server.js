import * as $ from 'svelte/internal/server';
import { upload } from './form.remote';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<form${$.attributes({ ...upload, enctype: 'multipart/form-data' })}><input${$.attributes({ ...upload.fields.text.as('hidden', 'Hello world') }, void 0, void 0, void 0, 4)}/> <p>File 1:</p> <input${$.attributes({ ...upload.fields.file1.as('file') }, void 0, void 0, void 0, 4)}/> <p>File 2:</p> <input${$.attributes({ ...upload.fields.file2.as('file') }, void 0, void 0, void 0, 4)}/> <label${$.attr_style('', { display: 'block' })}><input${$.attributes({ ...upload.fields.read_files.as('checkbox') }, void 0, void 0, void 0, 4)}/> Read files</label> <br/> <br/> <button>Submit</button></form> <pre>${$.escape(JSON.stringify(upload.result))}</pre>`);
	});
}