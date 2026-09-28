import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from 'svelte';

var root = $.from_html(`<button></button>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<span>(fallback)</span>`);
var root_3 = $.from_html(`<p class="error svelte-jwlrms"> </p>`);
var root_4 = $.from_html(`<h1>each block stress test</h1> <label><input type="checkbox"/> transition</label> <label><input type="checkbox"/> slow</label> <fieldset class="svelte-jwlrms"><legend class="svelte-jwlrms">random</legend> <button>test</button> <button> </button></fieldset> <fieldset class="svelte-jwlrms"><legend class="svelte-jwlrms">presets</legend> <!></fieldset> <form><fieldset class="svelte-jwlrms"><legend class="svelte-jwlrms">input</legend> <input/></fieldset></form> <div id="output"></div> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const VALUES = Array.from('abcdefghijklmnopqrstuvwxyz');

	const presets = [
		// b is never destroyed
		["ab", "", "a", "abc"],

		// the final state is 'abc', not 'cba'
		["abc", "", "cba"],

		// the case in https://github.com/sveltejs/svelte/pull/17240
		["abc", "adbc", "adebc"],
		["ab", "a", "abc"],
		["a", "bc", "bcd"]

		// add more presets by hitting 'party' and copying from the console
	];

	function shuffle() {
		const values = VALUES.slice();
		const number = Math.floor(Math.random() * VALUES.length);
		let shuffled = '';

		for (let i = 0; i < number; i++) {
			shuffled += values.splice(Math.floor(Math.random() * (number - i)), 1)[0];
		}

		return shuffled;
	}

	function mark(node) {
		let prev = -1;

		return {
			duration: $.get(transition) ? $.get(slow) ? 5000 : 500 : 0,
			tick(t) {
				const direction = t >= prev ? 'in' : 'out';

				node.style.color = direction === 'in' ? '' : 'grey';
				prev = t;
			}
		};
	}

	const record = [];
	const sleep = (ms = $.get(slow) ? 1000 : 100) => new Promise((f) => setTimeout(f, ms));

	async function test(x) {
		console.group(JSON.stringify(x));
		$.set(error, null);
		$.set(list, x, true);
		record.push($.get(list));

		if ($.get(transition)) {
			await sleep();
		} else {
			await tick();
			await tick();
		}

		check('reconcile');
		$.set(n, $.get(n) + 1);
		await tick();
		check('update');
		console.groupEnd();
	}

	function check(task) {
		const expected = $.get(list).split('').map((c) => `(${c}:${$.get(n)})`).join('') || '(fallback)';
		const children = Array.from(container.children);
		const filtered = children.filter((span) => !span.style.color);
		const received = filtered.map((span) => span.textContent).join('');

		if (expected !== received) {
			console.log('expected:', expected);
			console.log('received:', received);
			console.log(JSON.stringify(record, null, '  '));
			$.set(error, `failed to ${task}`);

			throw new Error($.get(error));
		}
	}

	let list = $.state('');
	let n = $.state(0);
	let error = $.state(null);
	let slow = $.state(false);
	let transition = $.state(true);
	let partying = $.state(false);
	let container;
	var fragment = root_4();
	var label = $.sibling($.first_child(fragment), 2);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	$.next();
	$.reset(label_1);

	var fieldset = $.sibling(label_1, 2);
	var button = $.sibling($.child(fieldset), 2);
	var button_1 = $.sibling(button, 2);
	var text = $.only_child(button_1, true);

	$.reset(fieldset);

	var fieldset_1 = $.sibling(fieldset, 2);
	var node_1 = $.sibling($.child(fieldset_1), 2);

	$.each(node_1, 17, () => presets, $.index, ($$anchor, preset, index) => {
		var button_2 = root();

		button_2.textContent = index + 1;

		$.delegated('click', button_2, async () => {
			for (let i = 0; i < $.get(preset).length; i += 1) {
				await test($.get(preset)[i]);
			}
		});

		$.append($$anchor, button_2);
	});

	$.reset(fieldset_1);

	var form = $.sibling(fieldset_1, 2);
	var div = $.sibling(form, 2);

	$.each(
		div,
		20,
		() => $.get(list),
		(c) => c,
		($$anchor, c) => {
			var span_1 = root_1();
			var text_1 = $.only_child(span_1);

			$.template_effect(() => $.set_text(text_1, `(${c ?? ''}:${$.get(n) ?? ''})`));
			$.transition(3, span_1, () => mark);
			$.append($$anchor, span_1);
		},
		($$anchor) => {
			var span_2 = root_2();

			$.transition(3, span_2, () => mark);
			$.append($$anchor, span_2);
		}
	);

	$.reset(div);
	$.bind_this(div, ($$value) => container = $$value, () => container);

	var node_2 = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			var p = root_3();
			var text_2 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_2, $.get(error)));
			$.append($$anchor, p);
		};

		$.if(node_2, ($$render) => {
			if ($.get(error)) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, $.get(partying) ? 'stop' : 'party'));
	$.bind_checked(input, () => $.get(transition), ($$value) => $.set(transition, $$value));
	$.bind_checked(input_1, () => $.get(slow), ($$value) => $.set(slow, $$value));
	$.delegated('click', button, () => test(shuffle()));

	$.delegated('click', button_1, async () => {
		if ($.get(partying)) {
			$.set(partying, false);
		} else {
			$.set(partying, true);

			while ($.get(partying)) await test(shuffle());
		}
	});

	$.event('submit', form, (e) => {
		e.preventDefault();
		test(e.currentTarget.querySelector('input').value);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);