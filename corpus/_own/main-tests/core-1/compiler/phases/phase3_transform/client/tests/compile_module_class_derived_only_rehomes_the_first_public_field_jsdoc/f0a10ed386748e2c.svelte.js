let wc_state = $state.raw({ base: '', error: null });
export const adapter_state = new (class {
	/** URL to the web container instance. */
	base = $derived(wc_state.base);
	/** Errors from within the web container instance. */
	error = $derived(wc_state.error);
})();
export function update(module) { wc_state = module.state; }