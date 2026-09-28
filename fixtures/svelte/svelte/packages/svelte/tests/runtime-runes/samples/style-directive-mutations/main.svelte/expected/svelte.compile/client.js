import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<main id="main"><div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div></main>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let margin = $.prop($$props, 'margin', 3, null),
		color = $.prop($$props, 'color', 3, 'red'),
		fontSize = $.prop($$props, 'fontSize', 3, '18px'),
		style1 = $.prop($$props, 'style1', 3, 'border: 1px solid'),
		style2 = $.prop($$props, 'style2', 3, 'border: 1px solid; margin: 1em'),
		style3 = $.prop($$props, 'style3', 3, 'color:blue; border: 1px solid; color: green;'),
		style4 = $.prop($$props, 'style4', 3, 'background:blue; background: linear-gradient(0, white 0%, red 100%)'),
		style5 = $.prop($$props, 'style5', 3, 'border: 1px solid; /* width: 100px; height: 100%; color: green */'),
		style6 = $.prop($$props, 'style6', 3, 'background: url(https://placehold.co/100x100?text=;&font=roboto);'),
		style7 = $.prop($$props, 'style7', 3, 'background: url("https://placehold.co/100x100?text=;&font=roboto");'),
		style8 = $.prop($$props, 'style8', 3, "background: url('https://placehold.co/100x100?text=;&font=roboto');");

	let mutations = [];
	let observer;

	if ($$props.browser) {
		observer = new MutationObserver(update_mutation_records);
		observer.observe(document.querySelector('#main'), { attributes: true, subtree: true });

		$.user_effect(() => {
			return () => observer.disconnect();
		});
	}

	function update_mutation_records(results) {
		for (const r of results) {
			mutations.push(r.target.nodeName);
		}
	}

	function get_and_clear_mutations() {
		update_mutation_records(observer.takeRecords());

		const result = mutations;

		mutations = [];

		return result;
	}

	var $$exports = { get_and_clear_mutations };
	var main = root();
	let styles;
	var div = $.child(main);
	let styles_1;
	var div_1 = $.sibling(div, 2);
	let styles_2;
	var div_2 = $.sibling(div_1, 2);
	let styles_3;
	var div_3 = $.sibling(div_2, 2);
	let styles_4;
	var div_4 = $.sibling(div_3, 2);
	let styles_5;
	var div_5 = $.sibling(div_4, 2);
	let styles_6;
	var div_6 = $.sibling(div_5, 2);
	let styles_7;
	var div_7 = $.sibling(div_6, 2);
	let styles_8;
	var div_8 = $.sibling(div_7, 2);
	let styles_9;

	$.reset(main);

	$.template_effect(() => {
		styles = $.set_style(main, '', styles, { color: $$props.browser ? 'white' : 'black' });

		styles_1 = $.set_style(div, '', styles_1, [
			{ margin: margin(), color: color() },
			{ 'font-size': fontSize() }
		]);

		styles_2 = $.set_style(div_1, style1(), styles_2, [
			{ margin: margin(), color: color() },
			{ 'font-size': fontSize() }
		]);

		styles_3 = $.set_style(div_2, style2(), styles_3, [
			{ margin: margin(), color: color() },
			{ 'font-size': fontSize() }
		]);

		styles_4 = $.set_style(div_3, style3(), styles_4, [
			{ margin: margin(), color: color() },
			{ 'font-size': fontSize() }
		]);

		styles_5 = $.set_style(div_4, style4(), styles_5, [
			{ margin: margin(), color: color() },
			{ 'font-size': fontSize() }
		]);

		styles_6 = $.set_style(div_5, style5(), styles_6, [
			{ margin: margin(), color: color() },
			{ 'font-size': fontSize() }
		]);

		styles_7 = $.set_style(div_6, style6(), styles_7, [
			{ margin: margin(), color: color() },
			{ 'font-size': fontSize() }
		]);

		styles_8 = $.set_style(div_7, style7(), styles_8, [
			{ margin: margin(), color: color() },
			{ 'font-size': fontSize() }
		]);

		styles_9 = $.set_style(div_8, style8(), styles_9, [
			{ margin: margin(), color: color() },
			{ 'font-size': fontSize() }
		]);
	});

	$.append($$anchor, main);

	return $.pop($$exports);
}