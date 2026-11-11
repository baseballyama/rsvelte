
export class SystemPrefersMode {
	#defaultValue = undefined;
	#track = true;
	#current = $state(this.#defaultValue);
	#persisted = $state(this.#makePersisted());
	#mediaQueryState = typeof window !== "undefined" && typeof window.matchMedia === "function"
		? new MediaQuery("prefers-color-scheme: light")
		: { current: false };
	query() {
		this.#current = this.#mediaQueryState.current ? "light" : "dark";
	}
	#makePersisted() {
		return {};
	}
	constructor() {
		$effect.root(() => {
			$effect.pre(() => {
				if (!this.#track) return;
				this.query();
			});
		});
	}
}
