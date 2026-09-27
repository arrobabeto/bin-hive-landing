// Binflow Surface Inventory (BSI) marker helper — astro-repo profile.
// Builds the static data-bf-* attributes for an editable root node.
// No runtime discovery and no inventory fetch: markers are plain HTML attrs.
// Rules: docs/BSI.md · inventory: binflow/surface-inventory.yaml
export type BfKind =
  | 'copy'
  | 'style_target'
  | 'image'
  | 'chrome_denied'
  | 'catalog_bound'
  | 'video'
  | 'overlay'
  | 'container';

export type BfPresentation = 'img' | 'background' | 'picture';

export interface BfAttributes {
  'data-bf-id': string;
  'data-bf-kind': BfKind;
  'data-bf-section': string;
  'data-bf-presentation'?: BfPresentation;
}

const BF_ID = /^[a-z0-9_]+\.[a-z0-9_]+\.[a-z0-9_]+$/u;

export function bf(id: string, kind: BfKind, presentation?: BfPresentation): BfAttributes {
  if (!BF_ID.test(id)) {
    throw new Error(`[bsi] Invalid bf_id "${id}": expected {area}.{section}.{field}`);
  }
  const section = id.split('.')[1] as string;
  return {
    'data-bf-id': id,
    'data-bf-kind': kind,
    'data-bf-section': section,
    ...(presentation ? { 'data-bf-presentation': presentation } : {}),
  };
}
