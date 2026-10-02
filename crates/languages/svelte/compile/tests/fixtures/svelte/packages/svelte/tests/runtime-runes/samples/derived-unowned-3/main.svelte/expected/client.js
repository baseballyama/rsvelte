import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Activate</button> <button>Toggle</button> `, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	class Model {
		#data = $.state();

		get data() {
			return $.get(this.#data);
		}

		set data(value) {
			$.set(this.#data, value, true);
		}

		constructor(data) {
			this.data = data;
		}

		#name = $.derived(() => this.data?.name);

		get name() {
			return $.get(this.#name);
		}

		set name(value) {
			$.set(this.#name, value);
		}

		#source = $.derived(() => this.data?.source);

		get source() {
			return $.get(this.#source);
		}

		set source(value) {
			$.set(this.#source, value);
		}

		toggle() {
			this.data.name = this.data.name === 'zeeba' ? 'neighba' : 'zeeba';
		}
	}

	let model = $.state($.proxy(new Model({ name: 'zeeba', source: 'initial' })));

	let setModel = (source) => {
		let next = new Model({ name: 'zeeba', source });

		$.set(model, next, true);
	};

	let needsSet = $.state(false);

	$.user_effect(() => {
		if ($.get(needsSet)) {
			setModel('effect');
			$.set(needsSet, false);
		}
	});

	let setWithEffect = () => {
		$.set(needsSet, true);
	};

	let toggle = () => {
		$.get(model).toggle();
	};

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var text = $.sibling(button_1);

	$.template_effect(() => $.set_text(text, ` ${$.get(model).name ?? ''}
${$.get(model).data.name ?? ''}`));

	$.delegated('click', button, setWithEffect);
	$.delegated('click', button_1, toggle);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);