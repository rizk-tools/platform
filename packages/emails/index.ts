const modules = import.meta.glob('./pages/*.vue', { eager: true });

const components: Record<string, any> = {};

for (const path in modules) {
  const componentName = path
    .split('/')
    .pop()!
    .replace('.vue', '');

  components[componentName] = (modules[path] as any).default;
}

export default components;
