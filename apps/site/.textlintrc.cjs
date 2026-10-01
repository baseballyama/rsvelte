module.exports = {
	rules: {
		'preset-ja-technical-writing': {
			'sentence-length': { max: 100, skipPatterns: ['/`[^`]*`/g'] },
			'no-exclamation-question-mark': false,
			'ja-no-mixed-period': false,
			'no-mix-dearu-desumasu': false,
			'arabic-kanji-numbers': false,
			'no-doubled-joshi': false,
			'max-comma': false
		},
		'@textlint-ja/preset-ai-writing': { 'ai-tech-writing-guideline': false },
		prh: { rulePaths: [require('node:path').join(__dirname, 'writing.yml')] },
		[require.resolve('./scripts/no-abbreviations.cjs')]: true
	}
};
