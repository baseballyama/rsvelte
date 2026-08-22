let backing = $state(0);
let peak = $state(0);

export const counter = {
	get value() {
		return backing;
	},
	set value(v) {
		backing = v;
		if (v > peak) peak = v;
	},
	get peak() {
		return peak;
	},
};

export class Tracked {
	#inner = $state('');

	get text() {
		return this.#inner;
	}

	set text(v) {
		this.#inner = v.trim();
	}

	static from(v) {
		const t = new Tracked();
		t.text = v;
		return t;
	}
}
