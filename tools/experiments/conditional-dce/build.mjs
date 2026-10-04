import { realpath } from "node:fs/promises";
import { build } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { digest, sourceFact, rewriteSource } from "./ast.mjs";
import { observeStyles } from "./plugins.mjs";
import { possibleVariants, snapshot, verifyReplay } from "./graph.mjs";

function flatten(plugins) {
  return plugins.flat(Infinity).filter(Boolean);
}

export async function certifiedBuild({
  config,
  compiler = {},
  plugins = [],
  targets,
  enabled = true,
}) {
  const hiddenPlugins = [
    config.build?.rolldownOptions,
    config.build?.rollupOptions,
  ].some(
    (options) =>
      options?.plugins ||
      [options?.output].flat().some((output) => output?.plugins),
  );
  if (config.plugins?.length || hiddenPlugins) {
    throw new Error("Pass external plugins through the plugins argument.");
  }
  if (config.configFile !== false)
    throw new Error("The prototype requires an explicit config.");
  targets = await Promise.all(targets.map((id) => realpath(id)));
  const targetSet = new Set(targets);
  const compilerOptions = Object.fromEntries(
    Object.entries(compiler).filter(([, value]) => value !== undefined),
  );
  const proofs = new Map();
  const decisions = new Map();
  let initialGraph;
  let cssArtifacts = [];
  let unsupportedOutput = false;
  let removed = 0;
  const external = flatten(plugins);
  // Output hooks may change a caller after graph analysis.
  const outputOptions = [
    config.build?.rolldownOptions?.output,
    config.build?.rollupOptions?.output,
  ]
    .flat()
    .filter(Boolean);
  unsupportedOutput =
    outputOptions.some((output) =>
      ["banner", "footer", "intro", "outro"].some((field) => output[field]),
    ) ||
    external.some((plugin) =>
      [
        "config",
        "configResolved",
        "transformIndexHtml",
        "options",
        "outputOptions",
        "resolveImportMeta",
        "resolveFileUrl",
        "renderChunk",
        "generateBundle",
        "buildEnd",
        "renderStart",
        "writeBundle",
      ].some((hook) => plugin[hook]),
    );

  async function run(replay) {
    const sources = new Map();
    let changedCss = false;
    const observedPlugins = observeStyles(external, () => {
      changedCss = true;
    });
    const sealedCss = new Map();
    const sealed = new Map();
    const rewritten = new Set();
    const inputs = new Map();
    const before = {
      name: "rsvelte-proof-source",
      transform(code, id) {
        inputs.set(id, digest(code));
        if (!targetSet.has(id)) return null;
        const fact = replay ? proofs.get(id) : sourceFact(code);
        sources.set(id, fact);
        if (!replay || !proofs.has(id)) return null;
        const proof = proofs.get(id);
        if (!fact || fact.source !== proof.source)
          throw new Error(`Compiler input changed: ${id}`);
        rewritten.add(id);
        removed++;
        return rewriteSource(code, proof, id);
      },
    };
    const after = {
      name: "rsvelte-proof-seal",
      transform(code, id) {
        if (targetSet.has(id)) {
          sealed.set(id, digest(code));
          const css = this.getModuleInfo(id)?.meta?.svelte?.css?.code;
          sealedCss.set(id, typeof css === "string" ? digest(css) : null);
        }
        return null;
      },
    };
    const final = {
      name: "rsvelte-proof-graph",
      enforce: "post",
      async buildEnd(error) {
        if (error) return;
        const graph = snapshot(this, inputs);
        if (replay && changedCss)
          throw new Error("A CSS plugin changed styles during replay.");
        cssArtifacts = [];
        for (const id of graph.keys()) {
          const css = this.getModuleInfo(id)?.meta?.svelte?.css;
          if (css?.code)
            cssArtifacts.push({ id, code: css.code, map: css.map });
        }
        for (const id of targets) {
          if (
            !graph.has(id) ||
            !sealed.has(id) ||
            graph.get(id).hash !== sealed.get(id) ||
            graph.get(id).cssHash !== sealedCss.get(id)
          ) {
            if (replay && rewritten.has(id))
              throw new Error(
                `A transform changed a rewritten component: ${id}`,
              );
            decisions.set(id, {
              unknown: true,
              reasons: ["A transform changed the compiler output."],
            });
            continue;
          }
          if (replay) continue;
          const decision = await possibleVariants(this, graph, id);
          if (!sources.get(id)) {
            decision.unknown = true;
            decision.reasons.push(
              "The compiler cannot certify this source shape.",
            );
          }
          if (
            compilerOptions.dynamicCompileOptions ||
            compilerOptions.compilerOptions?.customElement ||
            compilerOptions.compilerOptions?.cssHash ||
            compilerOptions.compilerOptions?.hmr ||
            compilerOptions.compilerOptions?.dev ||
            compilerOptions.compilerOptions?.css === "injected"
          ) {
            decision.unknown = true;
            decision.reasons.push("Unsupported compiler mode.");
          }
          if (config.build?.cssMinify === false) {
            decision.unknown = true;
            decision.reasons.push("CSS minification is disabled.");
          }
          if (
            changedCss ||
            config.css?.postcss ||
            Object.keys(config.css?.preprocessorOptions ?? {}).length
          ) {
            decision.unknown = true;
            decision.reasons.push(
              "An external CSS pipeline has no deletion contract.",
            );
          }
          if (unsupportedOutput) {
            decision.unknown = true;
            decision.reasons.push(
              "An external output hook has no preservation contract.",
            );
          }
          decisions.set(id, decision);
          if (!decision.unknown && !decision.values.includes("danger"))
            proofs.set(id, sources.get(id));
        }
        if (replay) verifyReplay(initialGraph, graph, rewritten);
        else initialGraph = graph;
      },
    };
    return build({
      ...config,
      css: { ...config.css, postcss: config.css?.postcss ?? { plugins: [] } },
      plugins: [
        before,
        ...svelte({ configFile: false, ...compilerOptions }),
        after,
        ...observedPlugins,
        final,
      ],
      build: { ...config.build, write: false },
    });
  }
  const baseline = await run(false);
  const output = enabled && proofs.size ? await run(true) : baseline;
  return {
    output,
    baseline,
    removed,
    builds: enabled && proofs.size ? 2 : 1,
    decisions: Object.fromEntries(decisions),
    proofCount: proofs.size,
    cssArtifacts,
  };
}
