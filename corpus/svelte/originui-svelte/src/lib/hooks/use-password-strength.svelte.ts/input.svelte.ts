export type PasswordRequirement = {
	regex: RegExp;
	text: string;
};

const DEFAULT_REQUIREMENTS: readonly PasswordRequirement[] = [
	{ regex: /.{8,}/, text: 'At least 8 characters' },
	{ regex: /[0-9]/, text: 'At least 1 number' },
	{ regex: /[a-z]/, text: 'At least 1 lowercase letter' },
	{ regex: /[A-Z]/, text: 'At least 1 uppercase letter' }
] as const;

export class PasswordStrength {
	#password = $state('');
	#isVisible = $state(false);
	readonly id: string;
	readonly requirements: readonly PasswordRequirement[] = DEFAULT_REQUIREMENTS;

	constructor(options: {
		id: string;
		initialPassword?: string;
		requirements?: PasswordRequirement[];
	}) {
		this.id = options.id;
		this.#password = options.initialPassword ?? '';
		if (options.requirements) {
			this.requirements = options.requirements;
		}

		this.toggleVisibility = this.toggleVisibility.bind(this);
	}

	get password() {
		return this.#password;
	}

	set password(value: string) {
		this.#password = value;
	}

	get isVisible() {
		return this.#isVisible;
	}

	toggleVisibility = () => {
		this.#isVisible = !this.#isVisible;
	};

	strength = $derived(
		this.requirements.map((req) => ({
			met: req.regex.test(this.#password),
			text: req.text
		}))
	);

	strengthScore = $derived(this.strength.filter((req) => req.met).length);

	get strengthColor() {
		if (this.strengthScore === 0) return 'bg-border';
		if (this.strengthScore <= 1) return 'bg-red-500';
		if (this.strengthScore <= 2) return 'bg-orange-500';
		if (this.strengthScore === 3) return 'bg-amber-500';
		return 'bg-emerald-500';
	}

	get strengthText() {
		if (this.strengthScore === 0) return 'Enter a password';
		if (this.strengthScore <= 2) return 'Weak password';
		if (this.strengthScore === 3) return 'Medium password';
		return 'Strong password';
	}
}

export function usePasswordStrength(options: {
	id: string;
	initialPassword?: string;
	requirements?: PasswordRequirement[];
}) {
	return new PasswordStrength(options);
}
