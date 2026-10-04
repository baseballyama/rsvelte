import { SyntaxKind, type Declaration, type ParameterDeclaration, type TypeParameterDeclaration } from 'typescript-7/unstable/ast';
import { SignatureKind, SymbolFlags, type Checker, type Signature, type Symbol, type Type } from 'typescript-7/unstable/sync';

export const MAX_TYPE_PAIRS = 2_000;
const MAX_TYPE_DEPTH = 100;
const READONLY_CHECK_FLAG = 8;

export class UnmeasuredType extends Error {}

export class TypeComparison {
	private readonly active = new Set<string>();
	private readonly parameters = new Map<number, number>();
	private readonly results = new Map<string, boolean | UnmeasuredType>();
	private pairs = 0;
	private readonly checker: Checker;
	constructor(checker: Checker) { this.checker = checker; }

	compare(left: Type | undefined, right: Type | undefined): boolean {
		if (!left || !right) throw new UnmeasuredType('unresolved type');
		const key = `${left.id}:${right.id}`;
		const known = this.results.get(key);
		if (known instanceof UnmeasuredType) throw known;
		if (known !== undefined) return known;
		this.pairs = 0;
		if (this.results.size >= MAX_TYPE_PAIRS) this.results.clear();
		try {
			const same = this.equal(left, right, 0) && this.checker.isTypeAssignableTo(left, right) && this.checker.isTypeAssignableTo(right, left);
			this.results.set(key, same);
			return same;
		} catch (error) {
			if (error instanceof UnmeasuredType) this.results.set(key, error);
			throw error;
		}
	}

	private equal(left: Type | undefined, right: Type | undefined, depth: number): boolean {
		if (!left || !right || left.isErrorType() || right.isErrorType()) throw new UnmeasuredType('unresolved type');
		if (++this.pairs > MAX_TYPE_PAIRS || depth > MAX_TYPE_DEPTH) throw new UnmeasuredType('type graph limit');
		const key = `${left.id}:${right.id}`;
		if (this.active.has(key)) return true;
		this.active.add(key);
		try {
			if (left.flags !== right.flags) {
				const structured = (type: Type) => type.isObjectType() || type.isIntersectionType();
				return structured(left) && structured(right) && this.object(left, right, depth);
			}
			if (left.isIntrinsicType() && right.isIntrinsicType()) return left.intrinsicName === right.intrinsicName;
			if (left.isLiteralType() && right.isLiteralType()) return left.value === right.value;
			if (left.isUnionType() && right.isUnionType()) {
				const a = this.members(left.getTypes()), b = this.members(right.getTypes());
				if (a.size !== b.size) return false;
				for (const [key, type] of a) {
					const other = b.get(key);
					if (!other || !this.equal(type, other, depth + 1)) return false;
				}
				return true;
			}
			if (left.isTypeParameter() && right.isTypeParameter()) {
				const bound = this.parameters.get(left.id);
				if (bound !== undefined && bound !== right.id) return false;
				return left.isThisType === right.isThisType &&
					this.optional(this.checker.getConstraintOfTypeParameter(left), this.checker.getConstraintOfTypeParameter(right), depth) &&
					this.optional(this.defaultType(left), this.defaultType(right), depth);
			}
			if (left.isIndexType() && right.isIndexType()) return this.equal(left.getTarget(), right.getTarget(), depth + 1);
			if (left.isIndexedAccessType() && right.isIndexedAccessType()) {
				return this.equal(left.getObjectType(), right.getObjectType(), depth + 1) && this.equal(left.getIndexType(), right.getIndexType(), depth + 1);
			}
			if (left.isConditionalType() && right.isConditionalType()) {
				return this.equal(left.getCheckType(), right.getCheckType(), depth + 1) && this.equal(left.getExtendsType(), right.getExtendsType(), depth + 1) &&
					this.equal(left.getTrueType(), right.getTrueType(), depth + 1) && this.equal(left.getFalseType(), right.getFalseType(), depth + 1);
			}
			if (left.isTemplateLiteralType() && right.isTemplateLiteralType()) {
				return JSON.stringify(left.texts) === JSON.stringify(right.texts) && this.list(left.getTypes(), right.getTypes(), depth);
			}
			if (left.isSubstitutionType() && right.isSubstitutionType()) {
				return this.equal(left.getBaseType(), right.getBaseType(), depth + 1) && this.equal(left.getConstraint(), right.getConstraint(), depth + 1);
			}
			if (left.isObjectType() && right.isObjectType() || left.isIntersectionType() && right.isIntersectionType()) return this.object(left, right, depth);
			throw new UnmeasuredType(`unsupported type flags ${left.flags}`);
		} finally {
			this.active.delete(key);
		}
	}

	private optional(left: Type | undefined, right: Type | undefined, depth: number): boolean {
		return left === undefined || right === undefined ? left === right : this.equal(left, right, depth + 1);
	}

	private list(left: readonly Type[], right: readonly Type[], depth: number): boolean {
		return left.length === right.length && left.every((type, index) => this.equal(type, right[index], depth + 1));
	}

	private object(left: Type, right: Type, depth: number): boolean {
		if (left.isTupleType() || right.isTupleType()) {
			if (!left.isTupleType() || !right.isTupleType()) return false;
			const a = left.getTarget(), b = right.getTarget();
			if (!a.isTupleType() || !b.isTupleType()) throw new UnmeasuredType('unresolved tuple target');
			if (a.readonly !== b.readonly || JSON.stringify(a.elementFlags) !== JSON.stringify(b.elementFlags)) return false;
			return this.list(this.checker.getTypeArguments(left), this.checker.getTypeArguments(right), depth);
		}
		if (this.checker.isArrayType(left) || this.checker.isArrayType(right)) {
			if (!left.isTypeReference() || !right.isTypeReference()) return false;
			if (!this.checker.isArrayType(left) || !this.checker.isArrayType(right)) return false;
			if (left.getTarget().getSymbol()?.name !== right.getTarget().getSymbol()?.name) return false;
			return this.list(this.checker.getTypeArguments(left), this.checker.getTypeArguments(right), depth);
		}
		const properties = (type: Type) => [...this.checker.getPropertiesOfType(type)].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
		const a = properties(left), b = properties(right);
		if (left.id !== right.id && [...a, ...b].some(nominal)) throw new UnmeasuredType('nominal brand requires a source identity adapter');
		if (a.length !== b.length) return false;
		const aTypes = this.checker.getTypeOfSymbol(a), bTypes = this.checker.getTypeOfSymbol(b);
		for (let index = 0; index < a.length; index++) {
			const x = a[index]!, y = b[index]!;
			if (x.name !== y.name || !!(x.flags & SymbolFlags.Optional) !== !!(y.flags & SymbolFlags.Optional) || readonly(x) !== readonly(y)) return false;
			if (!this.equal(aTypes[index], bTypes[index], depth + 1)) return false;
		}
		for (const kind of [SignatureKind.Call, SignatureKind.Construct]) {
			const x = this.checker.getSignaturesOfType(left, kind), y = this.checker.getSignaturesOfType(right, kind);
			if (x.length !== y.length || !x.every((signature, index) => this.signature(signature, y[index]!, depth))) return false;
		}
		const x = this.checker.getIndexInfosOfType(left), y = this.checker.getIndexInfosOfType(right);
		if (x.length !== y.length) return false;
		const indexes = new Map(y.map((info) => [this.memberKey(info.keyType), info]));
		if (indexes.size !== y.length) throw new UnmeasuredType('ambiguous index key shapes');
		return x.every((info) => {
			const other = indexes.get(this.memberKey(info.keyType));
			return !!other && info.isReadonly === other.isReadonly &&
				this.equal(info.keyType, other.keyType, depth + 1) && this.equal(info.valueType, other.valueType, depth + 1);
		});
	}

	private members(types: readonly Type[]): Map<string, Type> {
		const result = new Map<string, Type>();
		for (const type of types) {
			const key = this.memberKey(type);
			if (result.has(key)) throw new UnmeasuredType('ambiguous union member shapes');
			result.set(key, type);
		}
		return result;
	}

	private memberKey(type: Type): string {
		const leaf = (value: Type | undefined): string => {
			if (!value || value.isErrorType()) throw new UnmeasuredType('unresolved type');
			if (value.isLiteralType()) return `${value.flags}:${typeof value.value}:${value.value}`;
			return value.isObjectType() || value.isIntersectionType() ? 'structured' : String(value.flags);
		};
		if (!type.isObjectType() && !type.isIntersectionType()) return leaf(type);
		const properties = [...this.checker.getPropertiesOfType(type)].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
		const values = this.checker.getTypeOfSymbol(properties);
		return JSON.stringify(properties.map((property, index) => [property.name, !!(property.flags & SymbolFlags.Optional), readonly(property), leaf(values[index])]));
	}

	private signature(left: Signature, right: Signature, depth: number): boolean {
		if (left.hasRestParameter !== right.hasRestParameter || left.isAbstract !== right.isAbstract) return false;
		const a = left.getTypeParameters(), b = right.getTypeParameters();
		if (a.length !== b.length) return false;
		const previous = new Map(this.parameters);
		try {
			a.forEach((type, index) => this.parameters.set(type.id, b[index]!.id));
			if (!this.list(a, b, depth)) return false;
			const x = left.getParameters(), y = right.getParameters();
			if (x.length !== y.length) return false;
			for (let index = 0; index < x.length; index++) {
				if (optionalParameter(x[index]!) !== optionalParameter(y[index]!)) return false;
				if (!this.equal(this.checker.getParameterType(left, index), this.checker.getParameterType(right, index), depth + 1)) return false;
			}
			if (!this.optional(this.symbolType(left.getThisParameter()), this.symbolType(right.getThisParameter()), depth)) return false;
			const p = this.checker.getTypePredicateOfSignature(left), q = this.checker.getTypePredicateOfSignature(right);
			if (!!p !== !!q || p && q && (p.kind !== q.kind || p.parameterIndex !== q.parameterIndex || !this.optional(p.type, q.type, depth))) return false;
			return this.equal(this.checker.getReturnTypeOfSignature(left), this.checker.getReturnTypeOfSignature(right), depth + 1);
		} finally {
			this.parameters.clear();
			for (const [key, value] of previous) this.parameters.set(key, value);
		}
	}

	private symbolType(symbol: Symbol | undefined): Type | undefined {
		return symbol ? this.checker.getTypeOfSymbol(symbol) : undefined;
	}

	private defaultType(type: Type): Type | undefined {
		for (const handle of type.getSymbol()?.declarations ?? []) {
			const node = handle.resolve();
			if (node?.kind === SyntaxKind.TypeParameter) {
				const value = (node as TypeParameterDeclaration).defaultType;
				if (value) return this.checker.getTypeFromTypeNode(value);
			}
		}
		return undefined;
	}
}

function readonly(symbol: Symbol): boolean {
	if (symbol.checkFlags & READONLY_CHECK_FLAG) return true;
	if (symbol.flags & SymbolFlags.GetAccessor && !(symbol.flags & SymbolFlags.SetAccessor)) return true;
	return symbol.declarations.some((handle) => {
		const declaration = handle.resolve() as Declaration & { modifiers?: readonly NodeModifier[] } | undefined;
		return declaration?.modifiers?.some((modifier) => modifier.kind === SyntaxKind.ReadonlyKeyword) === true;
	});
}

interface NodeModifier { kind: SyntaxKind }

function nominal(symbol: Symbol): boolean {
	return symbol.declarations.some((handle) => {
		const node = handle.resolve() as Declaration & { name?: { kind: SyntaxKind }; modifiers?: readonly NodeModifier[] } | undefined;
		return node?.name?.kind === SyntaxKind.PrivateIdentifier || node?.modifiers?.some((modifier) =>
			modifier.kind === SyntaxKind.PrivateKeyword || modifier.kind === SyntaxKind.ProtectedKeyword) === true;
	});
}

function optionalParameter(symbol: Symbol): boolean {
	return !!(symbol.flags & SymbolFlags.Optional) || symbol.declarations.some((handle) => {
		const node = handle.resolve();
		if (node?.kind !== SyntaxKind.Parameter) return false;
		const parameter = node as ParameterDeclaration;
		return !!parameter.questionToken || !!parameter.initializer;
	});
}
