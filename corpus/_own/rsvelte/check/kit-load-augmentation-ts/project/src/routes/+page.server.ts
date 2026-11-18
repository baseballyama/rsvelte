// #2055 (2): a `const load = (...) => ...` whose initializer is itself a
// function must get its parameter typed directly — not wrapped in
// `satisfies`, which `findExports` reserves for a non-function-like
// initializer.
export const load = async ({ params }) => {
	return { slug: params.slug };
};
