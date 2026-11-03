import { SyntaxKind, SpanMapFidelity, type Node, type SourceFile } from 'typescript-7/unstable/ast';
import { SymbolFlags, type Diagnostic, type Project, type Type } from 'typescript-7/unstable/sync';
import { Coordinates } from './coordinates.ts';

export interface SourceQuery {
    start: number;
    end: number;
    kind: SyntaxKind;
}

export type TypeResult =
    | { status: 'measured' | 'unresolved'; nodes: readonly Node[]; types: readonly Type[] }
    | { status: 'unmapped'; nodes: readonly Node[]; types: readonly Type[] };

const VIRTUAL_DIAGNOSTIC_LOCATION = 18074;

const EMPTY_NODES: readonly Node[] = Object.freeze([]);
const EMPTY_TYPES: readonly Type[] = Object.freeze([]);

export class MappedNodes {
    readonly coordinates: Coordinates;
    readonly file: SourceFile;
    private readonly nodes = new Map<string, Node[]>();
    readonly count: number;

    constructor(file: SourceFile) {
        if (!file.contentMapper || !file.spanMap) throw new Error('source file needs a content mapper');
        this.file = file;
        this.coordinates = new Coordinates(file.originalText);
        let count = 0;
        const pending: Node[] = [file];
        while (pending.length) {
            const node = pending.pop()!;
            const start = node.getStart(file), end = node.getEnd();
            if (end > start) {
                const a = file.spanMap.virtualToOriginalPosition(start);
                const b = file.spanMap.virtualToOriginalPosition(end - 1);
                if (a.fidelity === SpanMapFidelity.Exact && b.fidelity === SpanMapFidelity.Exact &&
                    file.originalText.slice(a.position, b.position + 1) === file.text.slice(start, end)) {
                    const key = `${a.position}:${b.position + 1}:${node.kind}`;
                    const existing = this.nodes.get(key);
                    if (existing) existing.push(node);
                    else this.nodes.set(key, [node]);
                    count++;
                }
            }
            node.forEachChild(child => { pending.push(child); });
        }
        for (const nodes of this.nodes.values()) Object.freeze(nodes);
        this.count = count;
    }

    at(query: SourceQuery): readonly Node[] {
        if (query.end < query.start) throw new RangeError('source span is reversed');
        return this.atUtf16(this.coordinates.toUtf16(query.start), this.coordinates.toUtf16(query.end), query.kind);
    }

    atUtf16(start: number, end: number, kind: SyntaxKind): readonly Node[] {
        return this.nodes.get(`${start}:${end}:${kind}`) ?? EMPTY_NODES;
    }
}

export class ProjectTypeInfo {
    readonly project: Project;
    private readonly files = new Map<SourceFile, MappedNodes>();
    private readonly types = new Map<Node, Type>();
    private readonly diagnostics = new Map<SourceFile, readonly Diagnostic[]>();
    private typeRequests = 0;
    private diagnosticRequests = 0;

    constructor(project: Project) {
        this.project = project;
    }

    mappedNodes(file: SourceFile): MappedNodes {
        let nodes = this.files.get(file);
        if (!nodes) {
            nodes = new MappedNodes(file);
            this.files.set(file, nodes);
        }
        return nodes;
    }

    typesAt(file: SourceFile, query: SourceQuery): TypeResult {
        const nodes = this.mappedNodes(file).at(query);
        if (!nodes.length) return { status: 'unmapped', nodes, types: EMPTY_TYPES };
        const types = this.typesOf(nodes);
        return { status: types.some(type => type.isErrorType()) ? 'unresolved' : 'measured', nodes, types };
    }

    typesOf(nodes: readonly Node[]): readonly Type[] {
        const missing = [...new Set(nodes.filter(node => !this.types.has(node)))];
        if (missing.length) {
            const types = this.project.checker.getTypeAtLocation(missing);
            missing.forEach((node, index) => { this.types.set(node, types[index]!); });
            this.typeRequests++;
            const names = missing.filter(node => node.kind === SyntaxKind.Identifier && node.parent.kind === SyntaxKind.TypeReference);
            if (names.length) {
                const symbols = this.project.checker.getSymbolAtLocation(names);
                names.forEach((node, index) => {
                    const symbol = symbols[index];
                    if (symbol && symbol.flags & SymbolFlags.Type) {
                        this.types.set(node, this.project.checker.getDeclaredTypeOfSymbol(symbol));
                        this.typeRequests++;
                    }
                });
            }
        }
        return nodes.map(node => this.types.get(node)!);
    }

    semanticDiagnostics(file: SourceFile): readonly Diagnostic[] {
        let diagnostics = this.diagnostics.get(file);
        if (!diagnostics) {
            diagnostics = Object.freeze(this.project.program.getSemanticDiagnostics(file.fileName));
            this.diagnostics.set(file, diagnostics);
            this.diagnosticRequests++;
        }
        return diagnostics;
    }

    diagnosticSpan(file: SourceFile, diagnostic: Diagnostic): { start: number; end: number } | undefined {
        if (diagnostic.pos < 0 || diagnostic.end < diagnostic.pos || diagnostic.messageChain?.some(message => message.code === VIRTUAL_DIAGNOSTIC_LOCATION)) return undefined;
        const coordinates = this.mappedNodes(file).coordinates;
        return { start: coordinates.toByte(diagnostic.pos), end: coordinates.toByte(diagnostic.end) };
    }

    get measurements(): { files: number; nodes: number; cachedTypes: number; typeRequests: number; diagnosticRequests: number } {
        return {
            files: this.files.size,
            nodes: [...this.files.values()].reduce((count, file) => count + file.count, 0),
            cachedTypes: this.types.size,
            typeRequests: this.typeRequests,
            diagnosticRequests: this.diagnosticRequests
        };
    }
}
