type UseSliderWithInputProps = {
	defaultValue?: number[];
	initialValue?: number[];
	maxValue?: number;
	minValue?: number;
};

export class SliderWithInput {
	private minValue: number;
	private maxValue: number;
	private defaultValue: number[];

	public sliderValue = $state<number[]>([]);
	public inputValues = $state<string[]>([]);

	constructor({
		minValue = 0,
		defaultValue = [minValue],
		initialValue = [minValue],
		maxValue = 100
	}: UseSliderWithInputProps = {}) {
		this.minValue = minValue;
		this.maxValue = maxValue;
		this.defaultValue = defaultValue;

		this.sliderValue = [...initialValue];
		this.inputValues = initialValue.map((v) => v.toString());
		this.handleSliderChange = this.handleSliderChange.bind(this);
		this.resetToDefault = this.resetToDefault.bind(this);
		this.validateAndUpdateValue = this.validateAndUpdateValue.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
	}

	get showReset(): boolean {
		return (
			this.sliderValue.length === this.defaultValue.length &&
			!this.sliderValue.every((value, index) => value === this.defaultValue[index])
		);
	}

	validateAndUpdateValue = (rawValue: string, index: number): void => {
		if (rawValue === '' || rawValue === '-') {
			this.inputValues[index] = '0';
			this.sliderValue[index] = 0;
			return;
		}

		const numValue = parseFloat(rawValue);

		if (isNaN(numValue)) {
			this.inputValues[index] = this.sliderValue[index]!.toString();
			return;
		}

		let clampedValue = Math.min(this.maxValue, Math.max(this.minValue, numValue));

		if (this.sliderValue.length > 1) {
			if (index === 0) {
				clampedValue = Math.min(clampedValue, this.sliderValue[1]!);
			} else {
				clampedValue = Math.max(clampedValue, this.sliderValue[0]!);
			}
		}

		this.sliderValue[index] = clampedValue;
		this.inputValues[index] = clampedValue.toString();
	};

	handleInputChange = (e: Event, index: number): void => {
		const target = e.target as HTMLInputElement;
		const newValue = target.value;

		if (newValue === '' || /^-?\d*\.?\d*$/.test(newValue)) {
			this.inputValues[index] = newValue;
		}
	};

	handleSliderChange = (): void => {
		this.inputValues = this.sliderValue.map((v) => v.toString());
	};

	resetToDefault = (): void => {
		this.sliderValue = [...this.defaultValue];
		this.inputValues = this.defaultValue.map((v) => v.toString());
	};
}

export function useSliderWithInput(props: UseSliderWithInputProps = {}) {
	return new SliderWithInput(props);
}
