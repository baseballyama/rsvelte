import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { upload } from './form.remote';

var root = $.from_html(`<form><input/> <p>File 1:</p> <input/> <p>File 2:</p> <input/> <label><input/> Read files</label> <br/> <br/> <button>Submit</button></form> <pre> </pre>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var form = $.first_child(fragment);

	$.attribute_effect(form, () => ({ ...upload, enctype: 'multipart/form-data' }));

	var input = $.child(form);

	$.attribute_effect(input, ($0) => ({ ...$0 }), [() => upload.fields.text.as('hidden', 'Hello world')], void 0, void 0, void 0, true);

	var input_1 = $.sibling(input, 4);

	$.attribute_effect(input_1, ($0) => ({ ...$0 }), [() => upload.fields.file1.as('file')], void 0, void 0, void 0, true);

	var input_2 = $.sibling(input_1, 4);

	$.attribute_effect(input_2, ($0) => ({ ...$0 }), [() => upload.fields.file2.as('file')], void 0, void 0, void 0, true);

	var label = $.sibling(input_2, 2);

	$.set_style(label, '', {}, { display: 'block' });

	var input_3 = $.child(label);

	$.attribute_effect(input_3, ($0) => ({ ...$0 }), [() => upload.fields.read_files.as('checkbox')], void 0, void 0, void 0, true);
	$.next();
	$.reset(label);
	$.next(6);
	$.reset(form);

	var pre = $.sibling(form, 2);
	var text = $.only_child(pre, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify(upload.result)]);
	$.append($$anchor, fragment);
	$.pop();
}