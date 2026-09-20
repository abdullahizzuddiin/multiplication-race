export function createRouter(app) {
  let cleanup = () => {};

  return {
    navigate(render) {
      cleanup();
      app.replaceChildren();
      cleanup = render(app) || (() => {});
    },
    destroy() {
      cleanup();
      app.replaceChildren();
    },
  };
}
