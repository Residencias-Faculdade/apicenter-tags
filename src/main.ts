import { createCustomElement } from "@angular/elements";
import { createApplication } from "@angular/platform-browser";
import { WebComponent } from "./app/web-component/web-component";

(async () => {
  const app = await createApplication();

  const mfe_crud_tags = createCustomElement(WebComponent, { injector: app.injector });

  customElements.define('mfe-crud-tags', mfe_crud_tags);
})();