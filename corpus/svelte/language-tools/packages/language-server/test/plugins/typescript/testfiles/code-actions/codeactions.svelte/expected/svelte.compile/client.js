import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { C } from 'blubb';
import { B } from 'bla';
import { A } from 'bla';
import { D } from 'd';

var root = $.from_html(` <!> <button></button>`, 1);

export default function Codeactions($$anchor) {
	let a = true;

	A;
	C;

	let b = Math.random() > 0.5 ? true : false;

	abc();
	$.next();

	var fragment = root();
	var text = $.first_child(fragment);

	text.nodeValue = `${abc() ?? ''} `;

	var node = $.sibling(text);

	Empty(node, {});

	var button = $.sibling(node, 2);

	$.event('click', button, (e) => handleClick(e));
	$.append($$anchor, fragment);
}