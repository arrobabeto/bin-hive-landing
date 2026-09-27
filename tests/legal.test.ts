// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// LFPDPPP 2025: the full notice must carry the controller's identity and
// address (art. 15-I) and an ARCO contact (art. 15-V).
const CONTROLLER = 'G. Alberto Castañeda C.';
const CONTACT = 'hola@arrobabeto.com';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe.each(['es', 'en'])('privacy notice (%s)', (locale) => {
  const notice = read(`src/content/legal/${locale}.md`);

  it('identifies the controller with a full address and contact', () => {
    for (const fact of [CONTROLLER, 'La Floresta s/n', 'Huitzilac', '62517', CONTACT]) {
      expect(notice).toContain(fact);
    }
  });
});
