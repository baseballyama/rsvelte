module.exports = function (context) {
	const { Syntax, RuleError, report, getSource } = context;
	const technicalTerms = new Set(['AST', 'HIR']);
	const pattern = /(?<![\w])(?:[A-Z]{2,}(?:-\d+)?|db(?:\.rs)?|idx(?:\.rs)?|diag(?:\.rs)?|doc\.rs|Ctx|Loc|Idx|TsView|TsDoc)(?![\w])/g;
	function check(node, code = false) {
		const source = getSource(node);
		for (const match of source.matchAll(pattern)) {
			if (technicalTerms.has(match[0])) continue;
			if (code && !/^(?:db|idx|diag|doc\.rs|Ctx|Loc|Idx|TsView|TsDoc|AST|HIR|IR)/.test(match[0])) continue;
			report(node, new RuleError(`略語「${match[0]}」を使わず、日本語で意味を書いてください。実装名は Term またはコード引用で示してください。`, { index: match.index }));
		}
	}
	return { [Syntax.Str]: node => check(node), [Syntax.Code]: node => check(node, true) };
};
