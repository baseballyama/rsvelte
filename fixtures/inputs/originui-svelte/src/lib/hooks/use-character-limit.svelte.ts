export class CharacterLimit {
	#value = $state('');
	characterCount = $derived(this.#value.length);
	maxLength: number;

	constructor(maxLength: number, initialValue = '') {
		this.maxLength = maxLength;
		this.#value = initialValue;
	}

	set value(value: string) {
		if (value.length <= this.maxLength) {
			this.#value = value;
		}
	}

	get value() {
		return this.#value;
	}
}

export function useCharacterLimit(maxLength: number, initialValue = '') {
	return new CharacterLimit(maxLength, initialValue);
}
