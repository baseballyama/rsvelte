function styleModule(id) {
  return (
    /\.(css|scss|sass|less|styl|stylus)(\?|$)/.test(id) ||
    id.includes("type=style")
  );
}

export function observeStyles(plugins, changed) {
  return plugins.map((plugin) => {
    const copy = { ...plugin };
    for (const name of [
      "load",
      "transform",
      "buildStart",
      "buildEnd",
      "moduleParsed",
      "resolveId",
      "resolveDynamicImport",
    ]) {
      const hook = plugin[name];
      if (!hook) continue;
      const handler = typeof hook === "function" ? hook : hook.handler;
      async function observed(...args) {
        const context = new Proxy(this, {
          get(target, key) {
            if (key === "emitFile")
              return (file) => {
                changed("emitted file");
                return target.emitFile(file);
              };
            const value = Reflect.get(target, key, target);
            return typeof value === "function" ? value.bind(target) : value;
          },
        });
        const result = await handler.apply(context, args);
        const id = name === "load" ? args[0] : args[1];
        if (
          ["load", "transform"].includes(name) &&
          result != null &&
          (styleModule(id) || result.moduleType === "css")
        )
          changed(id);
        return result;
      }
      copy[name] =
        typeof hook === "function" ? observed : { ...hook, handler: observed };
    }
    return copy;
  });
}
