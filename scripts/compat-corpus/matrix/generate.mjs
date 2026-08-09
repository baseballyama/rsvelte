/**
 * Expand the declarative axes into concrete cases.
 *
 * Every case is `{ id, source }`; `id` is stable across runs (it is the ratchet
 * key), so adding a row to one axis never renumbers the others.
 */

import {
	BINDINGS,
	POSITIONS,
	COMMENT_KINDS,
	COMMENT_SEEDS,
	COMMENT_MODULE_SEEDS,
	LITERAL_ESCAPES,
	EXPRESSION_SLOTS,
	INVALID_BIND_TARGETS,
	VALID_BIND_TARGETS,
	BIND_SLOTS,
	BIND_PREAMBLE,
	BIND_PREAMBLE_TS,
	PARAM_FUNCTION_FORMS,
	PARAM_TEMPLATE_FORMS,
	PARAM_DEFAULT_SLOTS,
	PARAM_ILLEGAL_INITIALIZERS,
	PARAM_LEGAL_INITIALIZERS,
	PARAM_PREAMBLE,
	PARAM_TEMPLATE_PREAMBLE,
	PARAM_MODULE_PREAMBLE,
	EACH_COLLECTIONS,
	EACH_ITEM_SLOTS,
	EACH_PREAMBLE,
	EACH_EPILOGUE,
	SLASH_REGEX_PREFIXES,
	SLASH_DIVISION_CONTROLS,
	SLASH_HOSTS,
	REGEX_BODIES,
	PARAM_PATTERN_SHAPES,
	PARAM_PATTERN_SCRIPT_CONTEXTS,
	PARAM_PATTERN_MARKUP_CONTEXTS,
	PARAM_PATTERN_PREAMBLE,
	PARAM_PATTERN_MARKUP_PREAMBLE,
	DIRECTIVE_KINDS,
	DIRECTIVE_HOSTS,
	DIRECTIVE_MODES,
	BIND_SETTER_SHAPES,
	BIND_SETTER_HOSTS,
	BIND_SETTER_PREAMBLE,
} from './axes.mjs';
import { commentMutants } from './mutate.mjs';

function bindingPositionCases() {
	const cases = [];
	for (const [bindingName, binding] of Object.entries(BINDINGS)) {
		for (const [positionName, template] of Object.entries(POSITIONS)) {
			cases.push({
				id: `binding-position/${bindingName}__${positionName}.svelte`,
				source: binding.wrap(template.replaceAll('%s', binding.read)),
			});
		}
	}
	return cases;
}

function commentSlotCases() {
	const cases = [];
	for (const [seedName, seed] of Object.entries(COMMENT_SEEDS)) {
		for (const mutant of commentMutants(seed, COMMENT_KINDS)) {
			cases.push({
				id: `comment-slot/${seedName}__L${String(mutant.line).padStart(2, '0')}__${mutant.kind}.svelte`,
				source: mutant.source,
			});
		}
	}
	// The module path is a different compiler entry point (`compileModule`), so
	// it needs its own seeds and its own `kind` — `compile` rejects this source.
	for (const [seedName, seed] of Object.entries(COMMENT_MODULE_SEEDS)) {
		for (const mutant of commentMutants(seed.source, COMMENT_KINDS, { moduleSource: true })) {
			cases.push({
				id: `comment-slot/${seedName}__L${String(mutant.line).padStart(2, '0')}__${mutant.kind}${seed.ext}`,
				source: mutant.source,
				kind: 'module',
			});
		}
	}
	return cases;
}

function literalEscapeCases() {
	const cases = [];
	for (const [escapeName, literal] of Object.entries(LITERAL_ESCAPES)) {
		for (const [slotName, markup] of Object.entries(EXPRESSION_SLOTS)) {
			cases.push({
				id: `literal-escape/${escapeName}__${slotName}.svelte`,
				source: markup.replaceAll('%s', literal) + '\n',
			});
		}
	}
	return cases;
}

function invalidBindCases() {
	const cases = [];
	for (const [targetName, expression] of Object.entries(INVALID_BIND_TARGETS)) {
		for (const [slotName, markup] of Object.entries(BIND_SLOTS)) {
			cases.push({
				id: `invalid-bind/${targetName}__${slotName}.svelte`,
				source: BIND_PREAMBLE + markup.replaceAll('%s', expression) + '\n',
			});
		}
	}
	for (const [targetName, target] of Object.entries(VALID_BIND_TARGETS)) {
		for (const [slotName, markup] of Object.entries(BIND_SLOTS)) {
			cases.push({
				id: `invalid-bind/valid-${targetName}__${slotName}.svelte`,
				source:
					(target.ts ? BIND_PREAMBLE_TS : BIND_PREAMBLE) +
					markup.replaceAll('%s', target.expr) +
					'\n',
			});
		}
	}
	return cases;
}

function paramDefaultCases() {
	const cases = [];
	// The legal rows discriminate on (initializer × form) — where the keyword
	// sits relative to the nested function, and what encloses the parameter
	// list. Repeating them over every destructuring shape would add columns
	// that cannot move independently of `simple`; `nested-arrow-param` is kept
	// because re-entering a parameter list is the state the scan can get wrong.
	const LEGAL_SLOTS = ['simple', 'nested-arrow-param'];
	const initializers = [
		...Object.entries(PARAM_ILLEGAL_INITIALIZERS).map(([n, e]) => [n, e, null]),
		...Object.entries(PARAM_LEGAL_INITIALIZERS).map(([n, e]) => [`legal-${n}`, e, LEGAL_SLOTS]),
	];
	for (const [initName, initializer, slots] of initializers) {
		for (const [slotName, slot] of Object.entries(PARAM_DEFAULT_SLOTS)) {
			if (slots && !slots.includes(slotName)) continue;
			const params = slot.replaceAll('%s', initializer);
			for (const [formName, form] of Object.entries(PARAM_FUNCTION_FORMS)) {
				const statement = form.replaceAll('%s', params);
				cases.push({
					id: `param-default/${initName}__${slotName}__${formName}.svelte`,
					source: PARAM_PREAMBLE.replaceAll(
						'%s',
						statement
							.split('\n')
							.map((line) => `\t${line}`)
							.join('\n')
					),
				});
				cases.push({
					id: `param-default/${initName}__${slotName}__${formName}.svelte.js`,
					source: PARAM_MODULE_PREAMBLE.replaceAll('%s', statement),
					kind: 'module',
				});
			}
			for (const [formName, form] of Object.entries(PARAM_TEMPLATE_FORMS)) {
				cases.push({
					id: `param-default/${initName}__${slotName}__${formName}.svelte`,
					source: PARAM_TEMPLATE_PREAMBLE.replaceAll('%s', form.replaceAll('%s', params)),
				});
			}
		}
	}
	return cases;
}

function eachCollectionCases() {
	const cases = [];
	for (const [collectionName, expression] of Object.entries(EACH_COLLECTIONS)) {
		for (const [slotName, markup] of Object.entries(EACH_ITEM_SLOTS)) {
			cases.push({
				id: `each-collection/${collectionName}__${slotName}.svelte`,
				source: EACH_PREAMBLE + markup.replaceAll('%s', expression) + '\n\n' + EACH_EPILOGUE,
			});
		}
	}
	return cases;
}

/**
 * Rows whose host cross is narrowed, and why. Each entry names a pre-existing
 * divergence that has nothing to do with the slash and reproduces with no regex
 * in the source — ratcheting it here would put an entry in the baseline that
 * suppresses the row this family added it to measure.
 */
const KEYWORD_REGEX_HOST_EXCLUSIONS = {
	// `$derived` holding an `await` inside a NESTED async function compiles to
	// `await $.async_derived(…)` inside a non-async component function, which no
	// JS parser accepts. `$derived((async () => await String(v))())` does it too.
	await: ['runes-derived'],
	// A `class` declaration inside a template expression is dropped from the
	// client output. `{(() => { class T {} return 1; })()}` does it too.
	extends: ['template-expression', 'event-handler'],
	// Comment placement in the expression converter (blind spot 1a): official
	// keeps `/* return */` where rsvelte drops or moves it. The legacy hosts are
	// where the scan this control guards actually runs.
	'control-comment-ending-in-keyword': [
		'legacy-prop-default',
		'runes-derived',
		'runes-class-method',
		'template-expression',
		'event-handler',
	],
};

function keywordRegexCases() {
	const cases = [];
	const excluded = (row, host) => (KEYWORD_REGEX_HOST_EXCLUSIONS[row] ?? []).includes(host);
	// `slash-in-class` is the body that MOVES — it is the one that turns 12 of the
	// 15 keyword rows red when the previous-byte rule is restored — but it is run
	// against the legacy `$:` host only. Every other host still holds a scanner
	// with the previous-byte rule of its own, so crossing it there would enrol
	// ~178 comparisons of a defect this family did not come to measure. The host
	// cross therefore runs `delimiters`; see gate-coverage blind spot 5g.
	const BODY_HOST = 'legacy-reactive';
	const DEFAULT_BODY = 'delimiters';
	for (const [prefixName, template] of Object.entries(SLASH_REGEX_PREFIXES)) {
		for (const [hostName, host] of Object.entries(SLASH_HOSTS)) {
			if (excluded(prefixName, hostName)) continue;
			cases.push({
				id: `keyword-regex/${prefixName}__${hostName}${host.ext}`,
				source: host.wrap(template.replaceAll('%s', REGEX_BODIES[DEFAULT_BODY])),
				kind: host.kind,
			});
		}
		for (const [bodyName, body] of Object.entries(REGEX_BODIES)) {
			if (bodyName === DEFAULT_BODY) continue;
			cases.push({
				id: `keyword-regex/${prefixName}__body-${bodyName}.svelte`,
				source: SLASH_HOSTS[BODY_HOST].wrap(template.replaceAll('%s', body)),
			});
		}
	}
	for (const [controlName, expression] of Object.entries(SLASH_DIVISION_CONTROLS)) {
		for (const [hostName, host] of Object.entries(SLASH_HOSTS)) {
			if (excluded(`control-${controlName}`, hostName)) continue;
			cases.push({
				id: `keyword-regex/control-${controlName}__${hostName}${host.ext}`,
				source: host.wrap(expression),
				kind: host.kind,
			});
		}
	}
	return cases;
}

function paramPatternCases() {
	const cases = [];
	for (const [shapeName, shape] of Object.entries(PARAM_PATTERN_SHAPES)) {
		for (const [contextName, statement] of Object.entries(PARAM_PATTERN_SCRIPT_CONTEXTS)) {
			cases.push({
				id: `param-pattern/${shapeName}__${contextName}.svelte`,
				source: PARAM_PATTERN_PREAMBLE.replaceAll('%s', statement.replaceAll('%s', shape)),
			});
		}
		for (const [contextName, markup] of Object.entries(PARAM_PATTERN_MARKUP_CONTEXTS)) {
			cases.push({
				id: `param-pattern/${shapeName}__${contextName}.svelte`,
				source: PARAM_PATTERN_MARKUP_PREAMBLE.replaceAll('%s', markup.replaceAll('%s', shape)),
			});
		}
	}
	return cases;
}

function directiveElementCases() {
	const cases = [];
	for (const [modeName, preamble] of Object.entries(DIRECTIVE_MODES)) {
		for (const [directiveName, directive] of Object.entries(DIRECTIVE_KINDS)) {
			for (const [hostName, markup] of Object.entries(DIRECTIVE_HOSTS)) {
				cases.push({
					id: `directive-element/${modeName}__${directiveName}__${hostName}.svelte`,
					source: preamble.replaceAll('%s', markup.replaceAll('%s', directive)),
				});
			}
		}
	}
	return cases;
}

function bindSetterShapeCases() {
	const cases = [];
	for (const [shapeName, expression] of Object.entries(BIND_SETTER_SHAPES)) {
		for (const [hostName, markup] of Object.entries(BIND_SETTER_HOSTS)) {
			cases.push({
				id: `bind-setter/${shapeName}__${hostName}.svelte`,
				source: BIND_SETTER_PREAMBLE.replaceAll('%s', markup.replaceAll('%s', expression)),
			});
		}
	}
	return cases;
}

export const FAMILIES = {
	'binding-position': bindingPositionCases,
	'comment-slot': commentSlotCases,
	'literal-escape': literalEscapeCases,
	'invalid-bind': invalidBindCases,
	'param-default': paramDefaultCases,
	'each-collection': eachCollectionCases,
	'keyword-regex': keywordRegexCases,
	'param-pattern': paramPatternCases,
	'directive-element': directiveElementCases,
	'bind-setter': bindSetterShapeCases,
};

export function generate(families = Object.keys(FAMILIES)) {
	const cases = [];
	for (const name of families) {
		const build = FAMILIES[name];
		if (!build) throw new Error(`unknown matrix family "${name}" (known: ${Object.keys(FAMILIES).join(', ')})`);
		cases.push(...build());
	}
	const seen = new Set();
	for (const c of cases) {
		if (seen.has(c.id)) throw new Error(`duplicate matrix case id "${c.id}" — ids are ratchet keys and must be unique`);
		seen.add(c.id);
	}
	return cases;
}
