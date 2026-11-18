// #1918 audit: `load`'s `const` form was already covered by the `satisfies` wrapper
// (verified against tsgo directly — `satisfies` does contextually type the initializer's
// parameters here), but `entries` had no `VariableDeclaration` arm at all, so an
// arrow-const `entries` export went completely unaugmented.
export const load = async ({ params }) => {
	return { greeting: params };
};

// `slug` is a number here on purpose: `EntryGenerator` requires
// `Record<string, string>`, so the return-type annotation this augmentation adds
// must actually be enforced (not just silently absent) for this to catch a
// regression of the arrow-const narrowing.
export const entries = () => {
	return [{ slug: 123 }];
};
