import { MappedNodes } from '../../../type-information/src/index.ts';
import { parse } from 'svelte/compiler';
import { createScanner, SyntaxKind, type Node } from 'typescript-7/unstable/ast';

export interface Observation {
	start: number;
	end: number;
	role: string;
	key: string;
}

interface ObservationBranch {
	observation: Observation;
	children: ObservationBranch[];
}

export class ObservationIndex {
	private readonly roots: ObservationBranch[] = [];
	constructor(observations: readonly Observation[]) {
		const stack: ObservationBranch[] = [];
		for (const observation of [...observations].sort((a, b) => a.start - b.start || b.end - a.end)) {
			while (stack.length && (stack.at(-1)!.observation.end < observation.end || stack.at(-1)!.observation.end <= observation.start)) stack.pop();
			const branch = { observation, children: [] };
			(stack.at(-1)?.children ?? this.roots).push(branch);
			stack.push(branch);
		}
	}

	at(position: number): Observation | undefined {
		let children = this.roots, found: Observation | undefined;
		while (children.length) {
			let lo = 0, hi = children.length;
			while (lo < hi) {
				const middle = (lo + hi) >>> 1;
				if (children[middle]!.observation.start <= position) lo = middle + 1;
				else hi = middle;
			}
			const branch = children[lo - 1];
			if (!branch || position >= branch.observation.end) break;
			found = branch.observation;
			children = branch.children;
		}
		return found;
	}
}

const roles = new Map<number, string>([
	[SyntaxKind.Identifier, 'Identifier'],
	[SyntaxKind.PropertyAccessExpression, 'MemberExpression'],
	[SyntaxKind.ElementAccessExpression, 'MemberExpression'],
	[SyntaxKind.CallExpression, 'CallExpression'],
	[SyntaxKind.NewExpression, 'NewExpression'],
	[SyntaxKind.ArrowFunction, 'ArrowFunctionExpression'],
	[SyntaxKind.FunctionExpression, 'FunctionExpression'],
	[SyntaxKind.ConditionalExpression, 'ConditionalExpression'],
	[SyntaxKind.AwaitExpression, 'AwaitExpression'],
	[SyntaxKind.ObjectLiteralExpression, 'ObjectExpression'],
	[SyntaxKind.ArrayLiteralExpression, 'ArrayExpression'],
	[SyntaxKind.AsExpression, 'TSAsExpression'],
	[SyntaxKind.SatisfiesExpression, 'TSSatisfiesExpression'],
	[SyntaxKind.NonNullExpression, 'TSNonNullExpression'],
	[SyntaxKind.BinaryExpression, 'BinaryExpression'],
	[SyntaxKind.StringLiteral, 'Literal'],
	[SyntaxKind.NumericLiteral, 'Literal'],
	[SyntaxKind.BigIntLiteral, 'Literal'],
	[SyntaxKind.RegularExpressionLiteral, 'Literal'],
	[SyntaxKind.TrueKeyword, 'Literal'],
	[SyntaxKind.FalseKeyword, 'Literal'],
	[SyntaxKind.NullKeyword, 'Literal'],
	[SyntaxKind.TemplateExpression, 'TemplateLiteral'],
	[SyntaxKind.NoSubstitutionTemplateLiteral, 'TemplateLiteral'],
	[SyntaxKind.TaggedTemplateExpression, 'TaggedTemplateExpression']
]);
const sourceRoles = new Set(roles.values());
sourceRoles.add('LogicalExpression');
sourceRoles.add('AssignmentExpression');

export function sourceObservations(source: string): { observations: Observation[]; isTsFile: boolean } {
	const ast = parse(source, { modern: true });
	const scanner = createScanner(true);
	scanner.setText(source);
	const observations = new Map<string, Observation>();
	const pending: unknown[] = [ast];
	while (pending.length) {
		const value = pending.pop();
		if (!value || typeof value !== 'object') continue;
		if (Array.isArray(value)) {
			pending.push(...value);
			continue;
		}
		const node = value as Record<string, unknown>;
		if (typeof node.type === 'string' && sourceRoles.has(node.type) && typeof node.start === 'number' && typeof node.end === 'number') {
			let end = node.end;
			if (node.type === 'Identifier') {
				scanner.resetTokenState(node.start);
				scanner.scan();
				end = scanner.getTokenEnd();
			}
			const role = node.type === 'LogicalExpression' || node.type === 'AssignmentExpression' ? 'BinaryExpression' : node.type;
			const key = `${node.start}:${end}:${role}`;
			observations.set(key, { key, start: node.start, end, role });
		}
		for (const [key, child] of Object.entries(node)) {
			if (key !== 'loc' && key !== 'metadata') pending.push(child);
		}
	}
	const scripts = [ast.instance, ast.module].filter((script) => script != null);
	const isTsFile = scripts.some((script) => script.attributes.some((attribute) =>
		attribute.type === 'Attribute' && attribute.name === 'lang' && Array.isArray(attribute.value) &&
		attribute.value.some((part) => part.type === 'Text' && part.data === 'ts')));
	return { observations: [...observations.values()].sort((a, b) => a.start - b.start || a.end - b.end), isTsFile };
}

export class SourceMappings {
    private readonly index: MappedNodes;
    constructor(index: MappedNodes) { this.index = index; }

    nodes(observations: readonly Observation[]): Map<string, Node[]> {
        const result = new Map<string, Node[]>();
        const kinds = new Map<string, number[]>();
        for (const [kind, role] of roles) {
            const existing = kinds.get(role);
            if (existing) existing.push(kind);
            else kinds.set(role, [kind]);
        }
        for (const observation of observations) {
            const nodes = (kinds.get(observation.role) ?? []).flatMap(kind => this.index.atUtf16(observation.start, observation.end, kind));
            if (nodes.length) result.set(observation.key, nodes);
        }
        return result;
    }
}
