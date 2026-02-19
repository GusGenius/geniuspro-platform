export type CatKittenType = "model" | "vision_http" | "transform_js" | "transform_py";

export type CatModelKitten = {
  id: string;
  name: string;
  /**
   * Backwards compatible: legacy kittens omit `type` and are treated as `model`.
   */
  type?: "model";
  model_id: string;
  instructions: string;
};

export type CatVisionHttpKitten = {
  id: string;
  name: string;
  type: "vision_http";
  path: string;
  image_source: "original" | "previous_overlay";
};

export type CatTransformJsKitten = {
  id: string;
  name: string;
  type: "transform_js";
  code: string;
};

export type CatTransformPyKitten = {
  id: string;
  name: string;
  type: "transform_py";
  code: string;
};

export type CatKitten =
  | CatModelKitten
  | CatVisionHttpKitten
  | CatTransformJsKitten
  | CatTransformPyKitten;

export type CatRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  slug: string;
  kittens: CatKitten[];
  created_at: string;
  updated_at: string;
};

export type CatTemplateId =
  | "research-write"
  | "code-review"
  | "extract-validate"
  | "general";

export type CatTemplate = {
  id: CatTemplateId;
  label: string;
  description: string;
  defaultName: string;
  defaultDescription: string;
  // Templates are model-only for now.
  kittens: Array<Omit<CatModelKitten, "id">>;
};

