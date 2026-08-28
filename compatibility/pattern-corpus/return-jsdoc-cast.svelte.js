/** @returns {TThen} */
export function pin(then) {
	return /** @type {TThen} */ (
		(...args) => then(...args)
	);
}
