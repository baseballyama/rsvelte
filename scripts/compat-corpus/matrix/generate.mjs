/**
 * Expand the declarative axes into concrete cases.
 *
 * Every case is `{ id, source }`; `id` is stable across runs (it is the ratchet
 * key), so adding a row to one axis never renumbers the others.
 */

import {
	COMPILER_OPTIONS,
	COMPILER_OPTION_COMPONENTS,
	BINDINGS,
	POSITIONS,
	COMMENT_KINDS,
	COMMENT_SEEDS,
	COMMENT_MODULE_SEEDS,
	LITERAL_ESCAPES,
	EXPRESSION_SLOTS,
	FOLDABLE_EXPRESSIONS,
	FOLD_INDIRECTIONS,
	FOLD_INDIRECTION_READS,
	FOLD_INDIRECTION_SLOTS,
	FOLD_OPERAND_VALUES,
	FOLD_BINARY_OPERATORS,
	FOLD_UNARY_OPERATORS,
	FOLD_TERNARY_HOSTS,
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
	DIRECTIVE_MODIFIERS,
	DIRECTIVE_HOSTS,
	DIRECTIVE_MODES,
	BIND_SETTER_SHAPES,
	BIND_SETTER_HOSTS,
	BIND_SETTER_PREAMBLE,
	ASYNC_DERIVED_DECLARATIONS,
	ASYNC_DERIVED_IGNORES,
	ASYNC_DERIVED_ENTRIES,
	REMOVED_STATEMENTS,
	REMOVAL_COMMENT_SLOTS,
	REMOVAL_COMMENT_KINDS,
	REMOVAL_HOSTS,
	REMOVAL_SUCCESSORS,
	PRIVATE_FIELD_KINDS,
	PRIVATE_FIELD_RECEIVERS,
	PRIVATE_FIELD_POSITIONS,
	PRIVATE_FIELD_OPERATORS,
	PRIVATE_FIELD_UPDATE_OPERATORS,
	PRIVATE_FIELD_PREAMBLE,
	OPAQUE_KEYWORDS,
	OPAQUE_CARRIERS,
	OPAQUE_HOSTS,
	OPAQUE_ENTRIES,
	WRITE_BINDINGS,
	WRITE_HOSTS,
	WRITE_SHAPES,
	WRITE_PREAMBLE,
	RESERVED_TAG_NAMES,
	UNRESERVED_TAG_NAMES,
	TAG_NAME_HOSTS,
	TAG_NAME_PREAMBLE,
	ASYNC_ATTRIBUTE_VALUES,
	ASYNC_ATTRIBUTE_SLOTS,
	ASYNC_ATTRIBUTE_HOSTS,
	ASYNC_ATTRIBUTE_PREAMBLE,
	KEYWORD_SEPARATORS,
	KEYWORD_CONSTRUCTS,
	KEYWORD_SEPARATOR_ENTRIES,
	RUNE_STATEMENT_DECLARATIONS,
	RUNE_STATEMENT_CONTAINERS,
	RUNE_STATEMENT_ENTRIES,
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

function constantFoldCases() {
	const cases = [];
	for (const [expressionName, expression] of Object.entries(FOLDABLE_EXPRESSIONS)) {
		for (const [slotName, markup] of Object.entries(EXPRESSION_SLOTS)) {
			cases.push({
				id: `constant-fold/${expressionName}__inline__${slotName}.svelte`,
				source: markup.replaceAll('%s', expression) + '\n',
			});
		}
		for (const [indirectionName, declare] of Object.entries(FOLD_INDIRECTIONS)) {
			const declarations = declare(expression);
			const read = FOLD_INDIRECTION_READS[indirectionName];
			for (const slotName of FOLD_INDIRECTION_SLOTS) {
				cases.push({
					id: `constant-fold/${expressionName}__${indirectionName}__${slotName}.svelte`,
					source: `<script>\n\t${declarations}\n</script>\n\n${EXPRESSION_SLOTS[slotName].replaceAll('%s', read)}\n`,
				});
			}
		}
	}
	return cases;
}

function foldValueTypeCases() {
	const cases = [];
	const values = Object.entries(FOLD_OPERAND_VALUES);
	const OPERATOR_IDS = {
		'+': 'add',
		'-': 'sub',
		'===': 'strict-eq',
		'!==': 'strict-ne',
		'==': 'loose-eq',
		'!=': 'loose-ne',
		'<': 'lt',
		'>=': 'ge',
		'??': 'nullish',
		'||': 'or',
		'&&': 'and',
	};
	// One slot for the binary/unary product: what varies here is the operand's
	// type, which the fold decides before any slot sees the result, and the slot
	// axis is already walked in full by `constant-fold`'s own rows.
	const slot = EXPRESSION_SLOTS.interpolation;
	for (const [leftName, left] of values) {
		for (const operator of FOLD_BINARY_OPERATORS) {
			for (const [rightName, right] of values) {
				cases.push({
					id: `fold-value-type/${OPERATOR_IDS[operator]}__${leftName}__${rightName}.svelte`,
					source: slot.replaceAll('%s', `${left} ${operator} ${right}`) + '\n',
				});
			}
		}
		for (const [unaryName, form] of Object.entries(FOLD_UNARY_OPERATORS)) {
			cases.push({
				id: `fold-value-type/unary-${unaryName}__${leftName}.svelte`,
				source: slot.replaceAll('%s', form.replaceAll('%s', left)) + '\n',
			});
		}
	}
	for (const [leftName, left] of values) {
		for (const [rightName, right] of values) {
			for (const [hostName, wrap] of Object.entries(FOLD_TERNARY_HOSTS)) {
				cases.push({
					id: `fold-value-type/ternary-${hostName}__${leftName}__${rightName}.svelte`,
					source: wrap(`n > 3 ? ${left} : ${right}`),
				});
			}
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

function directiveModifierCases() {
	const cases = [];
	for (const [modeName, preamble] of Object.entries(DIRECTIVE_MODES)) {
		for (const [spellingName, directive] of Object.entries(DIRECTIVE_MODIFIERS)) {
			for (const [hostName, markup] of Object.entries(DIRECTIVE_HOSTS)) {
				cases.push({
					id: `directive-modifier/${modeName}__${spellingName}__${hostName}.svelte`,
					source: preamble.replaceAll('%s', markup.replaceAll('%s', directive)),
				});
			}
		}
	}
	return cases;
}

function removedStatementCommentCases() {
	const cases = [];
	const indent = (text, pad) =>
		text
			.split('\n')
			.map((line) => (line === '' ? line : pad + line))
			.join('\n');
	for (const [stmtName, template] of Object.entries(REMOVED_STATEMENTS)) {
		for (const slot of REMOVAL_COMMENT_SLOTS) {
			if (slot === 'interior' && !template.includes('%I')) continue;
			for (const kindName of REMOVAL_COMMENT_KINDS) {
				const comment = COMMENT_KINDS[kindName];
				for (const [hostName, host] of Object.entries(REMOVAL_HOSTS)) {
					for (const succName of REMOVAL_SUCCESSORS) {
						let stmt = template.replace('\n%I', slot === 'interior' ? `\n\t${comment}` : '');
						if (slot === 'leading') stmt = `${comment}\n${stmt}`;
						if (slot === 'trailing') stmt = `${stmt} ${comment}`;
						// One nesting level for `module`, two for a component `<script>`
						// (three inside `instance-fn`'s function body).
						const pad = hostName === 'instance-fn' ? '\t\t' : '\t';
						const succ = succName === 'succ-stmt' ? `${pad}console.log(2);\n` : '';
						cases.push({
							id: `removed-statement-comment/${stmtName}__${slot}-${kindName}__${hostName}__${succName}${host.ext}`,
							source: host.wrap(indent(stmt, pad), succ),
							...(host.ext === '.svelte.js' ? { kind: 'module' } : {}),
						});
					}
				}
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

function asyncDerivedCases() {
	const cases = [];
	for (const [entryName, entry] of Object.entries(ASYNC_DERIVED_ENTRIES)) {
		for (const [declName, declaration] of Object.entries(ASYNC_DERIVED_DECLARATIONS)) {
			for (const [ignoreName, ignore] of Object.entries(ASYNC_DERIVED_IGNORES)) {
				cases.push({
					id: `async-derived/${entryName}__${declName}__${ignoreName}${entry.ext ?? '.svelte'}`,
					source: entry.wrap(ignore.replaceAll('%s', declaration)),
					kind: entry.kind,
					// The one axis no other family varies. Without it the shape is
					// an `experimental_async` compile error in both compilers —
					// error-parity, which is agreement about nothing.
					options: { experimental: { async: true } },
				});
			}
		}
	}
	return cases;
}

const CLIENT_ONLY = ['client', 'client-dev'];
const SERVER_ONLY = ['server', 'server-dev'];

function runeStatementContainerCases() {
	const cases = [];
	for (const [declarationName, declaration] of Object.entries(RUNE_STATEMENT_DECLARATIONS)) {
		for (const [containerName, container] of Object.entries(RUNE_STATEMENT_CONTAINERS)) {
			if (declaration.containers && !declaration.containers.includes(containerName)) continue;
			const body = container
				.replaceAll('%d', () => declaration.declaration)
				.replaceAll('%u', () => declaration.use);
			for (const [entryName, entry] of Object.entries(RUNE_STATEMENT_ENTRIES)) {
				// #3420: a lexical rune declared bare in a `case` clause is lowered while its
				// references are not, so official returns the Source / Derived object itself.
				// `$state` and `$derived` are the same defect; both are recorded in
				// `upstream_issues/3420-svelte-case-clause-state-references-untransformed.md`.
				const hasBrokenClientOracle =
					(declarationName === 'state-let' || declarationName === 'derived-let') &&
					containerName === 'switch-case-bare';
				cases.push({
					id: `rune-statement-container/${declarationName}__${containerName}__${entryName}${entry.ext}`,
					source: entry.wrap(body),
					...(entry.kind ? { kind: entry.kind } : {}),
					// Official lowers the declaration but not its references on the
					// client for this exact row (#3420), producing NaN. Equality is
					// not an oracle there; the correct client output has a dedicated
					// invariant test and upstream_issues record.
					...(hasBrokenClientOracle ? { targets: SERVER_ONLY } : {}),
				});
			}
		}
	}
	return cases;
}

function privateFieldCases() {
	const cases = [];
	for (const [kindName, initializer] of Object.entries(PRIVATE_FIELD_KINDS)) {
		const isDerived = kindName.startsWith('derived');
		for (const [receiverName, receiver] of Object.entries(PRIVATE_FIELD_RECEIVERS)) {
			// `++`/`--` through a non-`this` receiver is a recorded deliberate
			// divergence on the client, which an equality gate cannot express.
			const operators =
				receiverName === 'this'
					? { ...PRIVATE_FIELD_OPERATORS, ...PRIVATE_FIELD_UPDATE_OPERATORS }
					: PRIVATE_FIELD_OPERATORS;
			for (const [positionName, member] of Object.entries(PRIVATE_FIELD_POSITIONS)) {
				for (const [operatorName, statement] of Object.entries(operators)) {
					const isUpdate = operatorName in PRIVATE_FIELD_UPDATE_OPERATORS;
					const isWrite = isUpdate || !operatorName.startsWith('read-');
					// A private `$derived` field is a callable on the server, and
					// upstream writes through one without unwrapping it —
					// `this.#f()++`, `inst.#f() += 1`, `inst.#f() = v`. Those are
					// not JavaScript, so there is nothing to compare against.
					const noServerOracle = isDerived && (isUpdate || (isWrite && receiverName !== 'this'));
					const body = member.replaceAll('%s', () => statement.replaceAll('%r', () => receiver));
					cases.push({
						id: `private-field/${kindName}__${receiverName}__${positionName}__${operatorName}.svelte.js`,
						source: PRIVATE_FIELD_PREAMBLE.replace('%f', () => initializer).replace('%s', () => body),
						kind: 'module',
						...(noServerOracle ? { targets: CLIENT_ONLY } : {}),
					});
				}
			}
		}
	}
	return cases;
}

function opaqueKeywordCases() {
	const cases = [];
	for (const [keywordName, keyword] of Object.entries(OPAQUE_KEYWORDS)) {
		for (const [carrierName, carrier] of Object.entries(OPAQUE_CARRIERS)) {
			for (const [hostName, host] of Object.entries(OPAQUE_HOSTS)) {
				const text = carrier[host.slot]
					.replaceAll('%k', () => keyword.text)
					.replaceAll('%r', () => keyword.regex);
				const body = host.wrap(text);
				for (const [entryName, entry] of Object.entries(OPAQUE_ENTRIES)) {
					cases.push({
						id: `opaque-keyword/${keywordName}__${carrierName}__${hostName}__${entryName}${entry.ext}`,
						source: entry.wrap(body),
						...(entry.kind ? { kind: entry.kind } : {}),
					});
				}
			}
		}
	}
	return cases;
}

function writeHostCases() {
	const cases = [];
	for (const [bindingName, binding] of Object.entries(WRITE_BINDINGS)) {
		for (const [hostName, host] of Object.entries(WRITE_HOSTS)) {
			for (const [shapeName, shape] of Object.entries(WRITE_SHAPES)) {
				const cross = shape.includes('%q');
				const write = shape
					.replaceAll('%q', () => binding.crossRead)
					.replaceAll('%s', () => binding.read);
				const script = host.script ? `\t${host.script.replaceAll('%s', () => write)}\n` : '';
				const declaration = cross ? binding.crossDeclaration : binding.declaration;
				const source = WRITE_PREAMBLE.replace('%d', () => declaration)
					.replace('%h', () => script)
					.replace('%m', () => host.markup.replaceAll('%s', () => write));
				cases.push({
					id: `write-host/${bindingName}__${hostName}__${shapeName}.svelte`,
					source,
				});
			}
		}
	}
	return cases;
}

function tagNameCases() {
	const cases = [];
	const names = [
		...RESERVED_TAG_NAMES.map((name) => ['reserved', name]),
		...UNRESERVED_TAG_NAMES.map((name) => ['plain', name]),
	];
	for (const [group, tag] of names) {
		for (const [hostName, host] of Object.entries(TAG_NAME_HOSTS)) {
			cases.push({
				id: `tag-name/${group}__${tag}__${hostName}.svelte`,
				source: TAG_NAME_PREAMBLE.replace('%m', () => host.replaceAll('%t', () => tag)),
			});
		}
	}
	return cases;
}

/** The value shapes that put a literal `await` in the attribute expression. */
const ASYNC_ATTRIBUTE_LITERAL_AWAIT = new Set([
	'await',
	'await-literal',
	'await-in-call',
	'await-plus-state',
]);

function asyncAttributeSlotCases() {
	const cases = [];
	for (const [hostName, host] of Object.entries(ASYNC_ATTRIBUTE_HOSTS)) {
		for (const [slotName, slot] of Object.entries(ASYNC_ATTRIBUTE_SLOTS)) {
			if (host.slots && !host.slots.includes(slotName)) continue;
			for (const [valueName, value] of Object.entries(ASYNC_ATTRIBUTE_VALUES)) {
				// `build_custom_element_attribute_update_assignment` is the one
				// attribute slot upstream does not route through `Memoizer`, so on
				// the pinned oracle it emits `await` inside a non-async arrow —
				// there is no client oracle for these four cells to compare
				// against. The server lowering is unaffected and still compared.
				const noClientOracle =
					hostName === 'custom-element' &&
					slotName === 'attribute' &&
					ASYNC_ATTRIBUTE_LITERAL_AWAIT.has(valueName);
				const markup = host.markup.replaceAll('%s', () =>
					slot.replaceAll('%A', () => host.attr).replaceAll('%s', () => value)
				);
				cases.push({
					id: `async-attribute-slot/${hostName}__${slotName}__${valueName}.svelte`,
					source: ASYNC_ATTRIBUTE_PREAMBLE.replaceAll('%i', () =>
						host.import ? "\timport Comp from './Comp.svelte';\n" : ''
					).replaceAll('%m', () => markup),
					// The one axis no other family but `async-derived` varies.
					// Without it every case is an `experimental_async` compile
					// error in both compilers — error-parity, which is agreement
					// about nothing.
					options: { experimental: { async: true } },
					...(noClientOracle ? { targets: SERVER_ONLY } : {}),
				});
			}
		}
	}
	return cases;
}

function compilerOptionCases() {
	const cases = [];
	for (const [optionName, options] of Object.entries(COMPILER_OPTIONS)) {
		for (const [componentName, source] of Object.entries(COMPILER_OPTION_COMPONENTS)) {
			cases.push({
				id: `compiler-option/${optionName}__${componentName}.svelte`,
				source,
				options,
			});
		}
	}
	return cases;
}

function keywordSeparatorCases() {
	const cases = [];
	for (const [constructName, construct] of Object.entries(KEYWORD_CONSTRUCTS)) {
		for (const [separatorName, separator] of Object.entries(KEYWORD_SEPARATORS)) {
			const body = construct.body.replaceAll('%s', () => separator);
			for (const [entryName, entry] of Object.entries(KEYWORD_SEPARATOR_ENTRIES)) {
				if (entry.kind === 'module' && !construct.module) continue;
				cases.push({
					id: `keyword-separator/${constructName}__${separatorName}__${entryName}${entry.ext}`,
					source: entry.wrap(construct, body),
					...(entry.kind ? { kind: entry.kind } : {}),
				});
			}
		}
	}
	return cases;
}

export const FAMILIES = {
	'binding-position': bindingPositionCases,
	'async-derived': asyncDerivedCases,
	'async-attribute-slot': asyncAttributeSlotCases,
	'comment-slot': commentSlotCases,
	'literal-escape': literalEscapeCases,
	'constant-fold': constantFoldCases,
	'fold-value-type': foldValueTypeCases,
	'invalid-bind': invalidBindCases,
	'param-default': paramDefaultCases,
	'each-collection': eachCollectionCases,
	'keyword-regex': keywordRegexCases,
	'param-pattern': paramPatternCases,
	'directive-element': directiveElementCases,
	'directive-modifier': directiveModifierCases,
	'bind-setter': bindSetterShapeCases,
	'removed-statement-comment': removedStatementCommentCases,
	'private-field': privateFieldCases,
	'opaque-keyword': opaqueKeywordCases,
	'write-host': writeHostCases,
	'compiler-option': compilerOptionCases,
	'keyword-separator': keywordSeparatorCases,
	'rune-statement-container': runeStatementContainerCases,
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
