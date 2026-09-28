import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value1 = void 0;
	let value2 = void 0;
	let value3 = void 0;
	let value4 = void 0;
	let value5 = void 0;
	let value6 = void 0;
	let value7 = void 0;
	let value8 = void 0;
	let value9 = null;
	let value10 = null;
	let value11 = null;
	let value12 = null;
	let value13 = null;
	let value14 = null;
	let value15 = null;
	let value16 = null;
	let value17 = 'y';
	let value18 = 'y';
	let value19 = 'y';
	let value20 = 'y';
	let value21 = 'y';
	let value22 = 'y';
	let value23 = 'y';
	let value24 = 'y';
	let checked1 = void 0;
	let checked2 = void 0;
	let checked3 = void 0;
	let checked4 = void 0;
	let checked5 = null;
	let checked6 = null;
	let checked7 = null;
	let checked8 = null;
	let checked9 = false;
	let checked10 = false;
	let checked11 = false;
	let checked12 = false;
	let checked13 = true;
	let checked14 = true;
	let selected1 = void 0;
	let selected2 = void 0;
	let selected3 = 'c';
	let selected4 = 'c';
	let selected5 = ['c'];
	let selected6 = ['c'];
	let defaultValue = 'x';
	let defaultChecked = true;

	$$renderer.push(`<form><p>Input/Textarea value</p> <div class="test-1"><input${$.attributes({ defaultvalue: defaultValue, value: value1 }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ defaultvalue: defaultValue, value: value2 }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ defaultvalue: 'x', value: value3 }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ defaultvalue: 'x', value: value4 }, void 0, void 0, void 0, 4)}/> <textarea>`);

	const $$body = $.escape(value5);

	if ($$body) {
		$$renderer.push(`${$$body}`);
	} else {}

	$$renderer.push(`</textarea> <textarea>`);

	const $$body_1 = $.escape(value6);

	if ($$body_1) {
		$$renderer.push(`${$$body_1}`);
	} else {}

	$$renderer.push(`</textarea> <textarea>`);

	const $$body_2 = $.escape(value7);

	if ($$body_2) {
		$$renderer.push(`${$$body_2}`);
	} else {}

	$$renderer.push(`</textarea> <textarea>`);

	const $$body_3 = $.escape(value8);

	if ($$body_3) {
		$$renderer.push(`${$$body_3}`);
	} else {}

	$$renderer.push(`</textarea></div> <div class="test-2"><input${$.attributes({ defaultvalue: defaultValue, value: value9 }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ defaultvalue: defaultValue, value: value10 }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ defaultvalue: 'x', value: value11 }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ defaultvalue: 'x', value: value12 }, void 0, void 0, void 0, 4)}/> <textarea>`);

	const $$body_4 = $.escape(value13);

	if ($$body_4) {
		$$renderer.push(`${$$body_4}`);
	} else {}

	$$renderer.push(`</textarea> <textarea>`);

	const $$body_5 = $.escape(value14);

	if ($$body_5) {
		$$renderer.push(`${$$body_5}`);
	} else {}

	$$renderer.push(`</textarea> <textarea>`);

	const $$body_6 = $.escape(value15);

	if ($$body_6) {
		$$renderer.push(`${$$body_6}`);
	} else {}

	$$renderer.push(`</textarea> <textarea>`);

	const $$body_7 = $.escape(value16);

	if ($$body_7) {
		$$renderer.push(`${$$body_7}`);
	} else {}

	$$renderer.push(`</textarea></div> <div class="test-3"><input${$.attributes({ defaultvalue: defaultValue, value: value17 }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ defaultvalue: defaultValue, value: value18 }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ defaultvalue: 'x', value: value19 }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ defaultvalue: 'x', value: value20 }, void 0, void 0, void 0, 4)}/> <textarea>`);

	const $$body_8 = $.escape(value21);

	if ($$body_8) {
		$$renderer.push(`${$$body_8}`);
	} else {}

	$$renderer.push(`</textarea> <textarea>`);

	const $$body_9 = $.escape(value22);

	if ($$body_9) {
		$$renderer.push(`${$$body_9}`);
	} else {}

	$$renderer.push(`</textarea> <textarea>`);

	const $$body_10 = $.escape(value23);

	if ($$body_10) {
		$$renderer.push(`${$$body_10}`);
	} else {}

	$$renderer.push(`</textarea> <textarea>`);

	const $$body_11 = $.escape(value24);

	if ($$body_11) {
		$$renderer.push(`${$$body_11}`);
	} else {}

	$$renderer.push(`</textarea></div> <p>Input checked</p> <div class="test-4"><input${$.attributes(
		{
			type: 'checkbox',
			defaultchecked: defaultChecked,
			checked: checked1
		},
		void 0,
		void 0,
		void 0,
		4
	)}/> <input${$.attributes(
		{
			type: 'checkbox',
			defaultchecked: defaultChecked,
			checked: checked2
		},
		void 0,
		void 0,
		void 0,
		4
	)}/> <input${$.attributes({ type: 'checkbox', defaultchecked: true, checked: checked3 }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ type: 'checkbox', defaultchecked: true, checked: checked4 }, void 0, void 0, void 0, 4)}/></div> <div class="test-5"><input${$.attributes(
		{
			type: 'checkbox',
			defaultchecked: defaultChecked,
			checked: checked5
		},
		void 0,
		void 0,
		void 0,
		4
	)}/> <input${$.attributes(
		{
			type: 'checkbox',
			defaultchecked: defaultChecked,
			checked: checked6
		},
		void 0,
		void 0,
		void 0,
		4
	)}/> <input${$.attributes({ type: 'checkbox', defaultchecked: true, checked: checked7 }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ type: 'checkbox', defaultchecked: true, checked: checked8 }, void 0, void 0, void 0, 4)}/></div> <div class="test-6"><input${$.attributes(
		{
			type: 'checkbox',
			defaultchecked: defaultChecked,
			checked: checked9
		},
		void 0,
		void 0,
		void 0,
		4
	)}/> <input${$.attributes(
		{
			type: 'checkbox',
			defaultchecked: defaultChecked,
			checked: checked10
		},
		void 0,
		void 0,
		void 0,
		4
	)}/> <input${$.attributes({ type: 'checkbox', defaultchecked: true, checked: checked11 }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ type: 'checkbox', defaultchecked: true, checked: checked12 }, void 0, void 0, void 0, 4)}/></div> <div class="test-7"><input${$.attributes({ type: 'checkbox', defaultchecked: false, checked: checked13 }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ type: 'checkbox', defaultchecked: false, checked: checked14 }, void 0, void 0, void 0, 4)}/></div> <p>Select (single)</p> `);

	$$renderer.select({ value: selected1 }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b', selected: true }, ($$renderer) => {
			$$renderer.push(`B`);
		});

		$$renderer.option({ value: 'c' }, ($$renderer) => {
			$$renderer.push(`C`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ value: selected2 }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b', selected: defaultChecked }, ($$renderer) => {
			$$renderer.push(`B`);
		});

		$$renderer.option({ value: 'c' }, ($$renderer) => {
			$$renderer.push(`C`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ value: selected3 }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b', selected: true }, ($$renderer) => {
			$$renderer.push(`B`);
		});

		$$renderer.option({ value: 'c' }, ($$renderer) => {
			$$renderer.push(`C`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ value: selected4 }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b', selected: defaultChecked }, ($$renderer) => {
			$$renderer.push(`B`);
		});

		$$renderer.option({ value: 'c' }, ($$renderer) => {
			$$renderer.push(`C`);
		});
	});

	$$renderer.push(` <p>Select (multiple)</p>  `);

	$$renderer.select({ multiple: true, value: selected5 }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b', selected: true }, ($$renderer) => {
			$$renderer.push(`B`);
		});

		$$renderer.option({ value: 'c' }, ($$renderer) => {
			$$renderer.push(`C`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ multiple: true, value: selected6 }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b', selected: defaultChecked }, ($$renderer) => {
			$$renderer.push(`B`);
		});

		$$renderer.option({ value: 'c' }, ($$renderer) => {
			$$renderer.push(`C`);
		});
	});

	$$renderer.push(` <p>Static values</p> <div class="test-14"><input${$.attributes({ value: 'x', defaultvalue: 'y' }, void 0, void 0, void 0, 4)}/> <input${$.attributes({ type: 'checkbox', checked: true, defaultchecked: false }, void 0, void 0, void 0, 4)}/> <textarea>x</textarea></div> <input type="reset" value="Reset"/></form> <p>Bound values: <span class="test-1">${$.escape(value1)} ${$.escape(value3)} ${$.escape(value6)} ${$.escape(value8)}</span> <span class="test-2">${$.escape(value9)} ${$.escape(value12)} ${$.escape(value14)} ${$.escape(value16)}</span> <span class="test-3">${$.escape(value17)} ${$.escape(value20)} ${$.escape(value22)} ${$.escape(value24)}</span> <span class="test-4">${$.escape(checked2)} ${$.escape(checked4)}</span> <span class="test-5">${$.escape(checked6)} ${$.escape(checked8)}</span> <span class="test-6">${$.escape(checked10)} ${$.escape(checked12)}</span> <span class="test-7">${$.escape(checked14)}</span> <span class="test-8">${$.escape(selected1)}</span> <span class="test-9">${$.escape(selected2)}</span> <span class="test-10">${$.escape(selected3)}</span> <span class="test-11">${$.escape(selected4)}</span> <span class="test-12">${$.escape(selected5)}</span> <span class="test-13">${$.escape(selected6)}</span></p>`);
}