import { createHash } from "node:crypto";
import { parse } from "svelte/compiler";
import { parseSync } from "rolldown/utils";
import MagicString from "magic-string";

const staticNodes = new Set([
  "Fragment",
  "IfBlock",
  "RegularElement",
  "Attribute",
  "Text",
  "BinaryExpression",
  "Identifier",
  "Literal",
  "Comment",
]);

export function digest(code) {
  return createHash("sha256").update(code).digest("hex");
}

export function nodes(value, parent = null, result = []) {
  if (!value || typeof value !== "object") return result;
  if (Array.isArray(value)) {
    for (const child of value) nodes(child, parent, result);
    return result;
  }
  if (typeof value.type === "string") result.push({ node: value, parent });
  for (const [key, child] of Object.entries(value)) {
    if (key !== "type") nodes(child, value, result);
  }
  return result;
}

export function javascript(code, id) {
  const parsed = parseSync(id, code);
  if (parsed.errors.length)
    throw new Error(`Cannot parse transformed module: ${id}`);
  return parsed.program;
}

export function sourceFact(code) {
  const tree = parse(code, { modern: true });
  const statements = tree.instance?.content.body;
  if (tree.options || tree.module || statements?.length !== 1) return null;
  const statement = statements[0];
  if (
    statement.type !== "VariableDeclaration" ||
    statement.declarations.length !== 1
  )
    return null;
  const binding = statement.declarations[0];
  if (
    binding.id.type !== "ObjectPattern" ||
    binding.id.properties.length !== 1 ||
    binding.init?.type !== "CallExpression" ||
    binding.init.callee.name !== "$props" ||
    binding.init.arguments.length !== 0
  )
    return null;
  const property = binding.id.properties[0];
  if (
    property.type !== "Property" ||
    property.computed ||
    property.key.name !== "variant" ||
    property.value.type !== "Identifier" ||
    property.value.name !== "variant"
  )
    return null;
  const branches = nodes(tree.fragment).filter(
    ({ node }) => node.type === "IfBlock",
  );
  if (branches.length !== 1) return null;
  const branch = branches[0].node;
  const test = branch.test;
  if (
    test.type !== "BinaryExpression" ||
    test.operator !== "===" ||
    test.left.type !== "Identifier" ||
    test.left.name !== "variant" ||
    test.right.type !== "Literal" ||
    test.right.value !== "danger" ||
    !branch.alternate ||
    branch.elseif
  )
    return null;
  // Calls and dynamic directives can write bindings through code we do not model.
  if (nodes(tree.fragment).some(({ node }) => !staticNodes.has(node.type)))
    return null;
  return { source: digest(code), branch, tree };
}

export function rewriteSource(code, fact, id) {
  if (digest(code) !== fact.source)
    throw new Error(`Source revision changed: ${id}`);
  const edit = new MagicString(code);
  edit.overwrite(fact.branch.test.start, fact.branch.test.end, "false");
  for (const node of fact.branch.consequent.nodes)
    edit.remove(node.start, node.end);
  return {
    code: edit.toString(),
    map: edit.generateMap({ hires: true, source: id, includeContent: true }),
  };
}
