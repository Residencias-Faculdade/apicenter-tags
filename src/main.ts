import { provideHttpClient } from '@angular/common/http';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { WebComponent } from './app/web-component/web-component';

(async () => {
  const app = await createApplication({
    providers: [provideHttpClient()],
  });

  const mfeCrudTags = createCustomElement(WebComponent, { injector: app.injector });

  customElements.define('mfe-crud-tags', mfeCrudTags);
})();
