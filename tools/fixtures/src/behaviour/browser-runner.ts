/// <reference lib="dom" />
// Runs in the browser: the Vapor browser test strips the types before serving it.
interface Behaviour {
  props?: Record<string, unknown>;
  custom_element?: string;
  custom_element_html?: string;
  animated_styles?: [string, string, number, number][];
  computed_styles?: [string, string][];
  steps?: ({ click: string } | { wait: number })[];
}
interface SvelteRuntime {
  mount(component: unknown, options: { target: Element; props: Record<string, unknown> }): unknown;
  unmount(instance: unknown): unknown;
  flushSync(): void;
}
interface VueRuntime {
  createVaporApp(component: unknown, props: Record<string, unknown>): { mount(root: Element): void; unmount(): void };
  nextTick(): Promise<void>;
}

const query = new URLSearchParams(location.search);
const runtime = query.get('runtime');
const observed = new Map<ResizeObserver, Set<Element>>();
const NativeResizeObserver = ResizeObserver;
globalThis.ResizeObserver = class extends NativeResizeObserver {
  override observe(element: Element, options?: ResizeObserverOptions) {
    let elements = observed.get(this);
    if (!elements) { elements = new Set(); observed.set(this, elements); }
    elements.add(element);
    super.observe(element, options);
  }
  override unobserve(element: Element) {
    const elements = observed.get(this);
    elements?.delete(element);
    if (!elements?.size) observed.delete(this);
    super.unobserve(element);
  }
  override disconnect() { observed.delete(this); super.disconnect(); }
};
const result = document.querySelector('#result')!;
const errors: string[] = [];
addEventListener('error', (event) => errors.push(event.message));
addEventListener('unhandledrejection', (event) => errors.push(String(event.reason)));
const root = document.querySelector('#root')!;
const frames = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
let behaviour: Behaviour;
let stepIndex = 0;
let measureMotion = false;
const lookup = (selector: string): HTMLElement | undefined => {
  const element = root.querySelector<HTMLElement>(selector);
  if (element) return element;
  for (const host of root.querySelectorAll('*')) {
    const element = host.shadowRoot?.querySelector<HTMLElement>(selector);
    if (element) return element;
  }
};
const find = (selector: string): HTMLElement => {
  const element = lookup(selector);
  if (!element) throw new Error(`no element matches ${selector}`);
  return element;
};
const shadow = () => Array.from(root.querySelectorAll('*')).filter((element) => element.shadowRoot).map((element) => {
  const container = document.createElement('div');
  for (const node of element.shadowRoot!.childNodes) {
    if (node instanceof Element && node.localName === 'style') continue;
    container.appendChild(node.cloneNode(true));
  }
  return { tag: element.localName, html: container.innerHTML };
});
const motionStyles = () => (behaviour.animated_styles ?? []).map(([selector, property, from, to]) => {
  // The first paint can contain different elapsed times in the two runtimes.
  if (!measureMotion) return 'UNMEASURED';
  const element = lookup(selector);
  if (!element) return 'absent';
  const style = getComputedStyle(element);
  const value = property === 'translateY' ? new DOMMatrix(style.transform).m42 : Number(style.getPropertyValue(property));
  if (!Number.isFinite(value)) throw new Error(`non-numeric animated style ${property}`);
  if (value === from) return 'from';
  if (value === to) return 'to';
  return value > Math.min(from, to) && value < Math.max(from, to) ? 'between' : `outside:${value}`;
});
const record = () => ({ html: root.innerHTML, shadow: shadow(), motion: motionStyles(), computed: (behaviour.computed_styles ?? []).map(([selector, property]) => root.childElementCount ? getComputedStyle(find(selector)).getPropertyValue(property) : '' ), scroll: [window.scrollX, window.scrollY], observed: Array.from(observed.values()).reduce((count, elements) => count + elements.size, 0) });
try {
  const component = (await import(`/component.js${location.search}`)).default;
  behaviour = await (await fetch(`/behaviour.json${location.search}`)).json();
  let flush: () => Promise<void>;
  let unmount: () => unknown;
  if (runtime === 'svelte') {
    const svelte = (await import('svelte')) as unknown as SvelteRuntime;
    const host = behaviour.custom_element ? document.createElement(behaviour.custom_element) : null;
    if (host) {
      Object.assign(host, behaviour.props ?? {});
      host.innerHTML = behaviour.custom_element_html ?? "";
      root.appendChild(host);
    }
    const instance = host ? null : svelte.mount(component, { target: root, props: behaviour.props ?? {} });
    flush = async () => { svelte.flushSync(); await frames(); svelte.flushSync(); };
    unmount = () => host ? host.remove() : svelte.unmount(instance);
  } else {
    const vue = (await import('vue')) as unknown as VueRuntime;
    const host = behaviour.custom_element ? document.createElement(behaviour.custom_element) : null;
    const app = host ? null : vue.createVaporApp(component, behaviour.props ?? {});
    if (host) {
      Object.assign(host, behaviour.props ?? {});
      host.innerHTML = behaviour.custom_element_html ?? "";
      root.appendChild(host);
    } else app!.mount(root);
    flush = async () => { await vue.nextTick(); await frames(); await vue.nextTick(); };
    unmount = () => host ? host.remove() : app!.unmount();
  }
  await flush();
  const steps = [record()];
  for (const step of behaviour.steps ?? []) {
    stepIndex++;
    measureMotion = 'wait' in step;
    if ('click' in step) find(step.click).click();
    else if ('wait' in step) await new Promise((resolve) => setTimeout(resolve, step.wait));
    else throw new Error(`unsupported browser action: ${JSON.stringify(step)}`);
    await flush();
    steps.push(record());
  }
  measureMotion = true;
  await unmount();
  await flush();
  steps.push(record());
  result.textContent = JSON.stringify({ steps, errors });
} catch (error) {
  result.textContent = JSON.stringify({ error: `step ${stepIndex}: ${String(error)}`, html: root.innerHTML, errors });
}
