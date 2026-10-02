import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Legacy from './Legacy.svelte';
import Runes from './Runes.svelte';
import RunesGeneric from './RunesGeneric.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	let bind_and_prop;
	let value = '';
	let only_bind;
	let can_bind = '';
	let readonly = '';
	let instance;

	instance.only_bind() === true;

	var fragment = root();
	var node = $.first_child(fragment);

	Legacy(node, {
		get bind_and_prop() {
			return bind_and_prop;
		},

		set bind_and_prop($$value) {
			bind_and_prop = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Legacy(node_1, {
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Legacy(node_2, {
		get value() {
			return value;
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Legacy(node_3, {
		get bind_and_prop() {
			return bind_and_prop;
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Runes(node_4, {
		get can_bind() {
			return can_bind;
		},

		set can_bind($$value) {
			can_bind = $$value;
		}
	});

	var node_5 = $.sibling(node_4, 2);

	Runes(node_5, {
		get can_bind() {
			return can_bind;
		}
	});

	var node_6 = $.sibling(node_5, 2);

	Runes(node_6, {
		get readonly() {
			return readonly;
		}
	});

	var node_7 = $.sibling(node_6, 2);

	Runes(node_7, {
		get readonly() {
			return readonly;
		},

		set readonly($$value) {
			readonly = $$value;
		}
	});

	var node_8 = $.sibling(node_7, 2);

	Runes(node_8, {
		get only_bind() {
			return only_bind;
		},

		set only_bind($$value) {
			only_bind = $$value;
		}
	});

	var node_9 = $.sibling(node_8, 2);

	Runes(node_9, {
		get only_bind() {
			return only_bind;
		}
	});

	var node_10 = $.sibling(node_9, 2);

	RunesGeneric(node_10, {
		get readonly() {
			return readonly;
		},

		set readonly($$value) {
			readonly = $$value;
		}
	});

	var node_11 = $.sibling(node_10, 2);

	RunesGeneric(node_11, {
		get only_bind() {
			return only_bind;
		},

		set only_bind($$value) {
			only_bind = $$value;
		}
	});

	var node_12 = $.sibling(node_11, 2);

	RunesGeneric(node_12, {
		get only_bind() {
			return only_bind;
		}
	});

	$.append($$anchor, fragment);
}