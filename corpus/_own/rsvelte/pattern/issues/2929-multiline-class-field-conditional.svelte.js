export class SystemPrefersMode {
  #current = $state(undefined);
  #mediaQueryState =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? new MediaQuery("prefers-color-scheme: light")
      : { current: false };

  query() {
    this.#current = this.#mediaQueryState.current ? "light" : "dark";
  }
}
