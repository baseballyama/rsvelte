// Most textlint rules ship no types. The kernel checks each rule's shape when the linter is created.
declare module 'textlint-rule-*' {
	const rule: unknown;
	export default rule;
}
declare module '@textlint-rule/*' {
	const rule: unknown;
	export default rule;
}
