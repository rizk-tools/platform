const modules = import.meta.glob('./components/emails/*.vue', { eager: true });

const components: Record<string, any> = {};

for (const path in modules) {
  const componentName = path
    .split('/')
    .pop()!
    .replace('.vue', '');

  components[componentName] = (modules[path] as any).default;
}

export const welcome = components.welcome;
export const invite = components.invite;
