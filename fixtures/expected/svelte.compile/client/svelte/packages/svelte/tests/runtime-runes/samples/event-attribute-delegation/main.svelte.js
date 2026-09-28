import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div><div><button>Button</button></div></div></div>`);

export default function Main($$anchor) {
	const action = () => {};
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var button = $.only_child(div_2);

	$.reset(div_1);
	$.action(div_1, ($$node) => action?.($$node));
	$.reset(div);
	$.action(div, ($$node) => action?.($$node));
	$.delegated('click', div, () => console.log('clicked container'));
	$.delegated('keydown', div, () => {});

	$.delegated('click', div_1, (e) => {
		console.log('clicked div 1');
	});

	$.delegated('click', div_2, (e) => {
		console.log('clicked div 2');
	});

	$.delegated('click', button, (e) => {
		console.log('clicked button');
	});

	$.append($$anchor, div);
}

$.delegate(['click', 'keydown']);