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

export const FAMILIES = {
	'binding-position': bindingPositionCases,
	'comment-slot': commentSlotCases,
	'literal-escape': literalEscapeCases,
	'invalid-bind': invalidBindCases,
	'param-default': paramDefaultCases,
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
