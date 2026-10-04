import { digest, javascript, nodes } from "./ast.mjs";

export function snapshot(context, inputs) {
  const result = new Map();
  for (const id of context.getModuleIds()) {
    const info = context.getModuleInfo(id);
    if (!info) continue;
    result.set(id, {
      code: info.code,
      inputHash: inputs.get(id),
      cssHash:
        typeof info.meta?.svelte?.css?.code === "string"
          ? digest(info.meta.svelte.css.code)
          : null,
      hash: typeof info.code === "string" ? digest(info.code) : null,
      entry: info.isEntry,
      imports: [...info.importedIds].sort(),
      dynamic: [...info.dynamicallyImportedIds].sort(),
    });
  }
  return result;
}

export async function possibleVariants(context, graph, target) {
  const values = new Set();
  const reasons = [];
  let calls = 0;
  if (graph.get(target)?.entry)
    reasons.push("The component is a public entry.");
  for (const [id, info] of graph) {
    if (info.dynamic.includes(target))
      reasons.push(`Dynamic component import: ${id}`);
    if (!info.imports.includes(target)) continue;
    if (!info.code) {
      reasons.push(`Missing importer code: ${id}`);
      continue;
    }
    const tree = javascript(info.code, id);
    const names = new Set();
    for (const statement of tree.body) {
      if (statement.type !== "ImportDeclaration") continue;
      const resolved = await context.resolve(statement.source.value, id);
      if (resolved?.id !== target) continue;
      for (const specifier of statement.specifiers) {
        if (specifier.type === "ImportDefaultSpecifier")
          names.add(specifier.local.name);
        else reasons.push(`Unsupported import: ${id}`);
      }
    }
    if (!names.size) {
      reasons.push(`Re-export or unknown import: ${id}`);
      continue;
    }
    for (const { node, parent } of nodes(tree)) {
      if (node.type !== "Identifier" || !names.has(node.name)) continue;
      if (parent.type === "ImportDefaultSpecifier") continue;
      if (
        parent.type !== "CallExpression" ||
        parent.callee !== node ||
        parent.arguments.length !== 2
      ) {
        reasons.push(`Escaped component reference: ${id}`);
        continue;
      }
      const props = parent.arguments[1];
      if (
        props.type !== "ObjectExpression" ||
        props.properties.some(
          (property) =>
            property.type !== "Property" ||
            property.computed ||
            property.kind !== "init" ||
            property.method,
        )
      ) {
        reasons.push(`Unknown props: ${id}`);
        continue;
      }
      const properties = props.properties.filter(
        (property) =>
          property.key.name === "variant" || property.key.value === "variant",
      );
      if (
        properties.length !== 1 ||
        properties[0].value.type !== "Literal" ||
        typeof properties[0].value.value !== "string"
      ) {
        reasons.push(`Unknown or duplicate variant: ${id}`);
        continue;
      }
      calls++;
      values.add(properties[0].value.value);
    }
  }
  if (!calls) reasons.push("No proven callers.");
  return {
    calls,
    values: [...values].sort(),
    reasons,
    unknown: reasons.length > 0,
  };
}

export function verifyReplay(before, after, rewritten) {
  for (const [id, current] of after) {
    const previous = before.get(id);
    if (!previous) throw new Error(`New module during replay: ${id}`);
    if (previous.entry !== current.entry)
      throw new Error(`Entry status changed during replay: ${id}`);
    if (
      rewritten.has(id) ||
      (rewritten.has(id.split("?")[0]) && id.includes("type=style"))
    )
      continue;
    if (
      previous.hash !== current.hash ||
      previous.inputHash !== current.inputHash ||
      previous.cssHash !== current.cssHash ||
      previous.entry !== current.entry ||
      JSON.stringify(previous.imports) !== JSON.stringify(current.imports) ||
      JSON.stringify(previous.dynamic) !== JSON.stringify(current.dynamic)
    ) {
      throw new Error(`Module or graph changed during replay: ${id}`);
    }
  }
  for (const [id, previous] of before) {
    if (previous.entry && !after.has(id))
      throw new Error(`Entry disappeared during replay: ${id}`);
  }
}
