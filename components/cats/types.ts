export type CatKittenType =
  | "model"
  | "vision_http"
  | "image_gen"
  | "transform_js"
  | "transform_py";

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
  /**
   * Optional: request the vision server to use a specific model.
   * Requires the vision server endpoint to support this field.
   */
  model_id?: string;
  /**
   * Optional: pass extra instructions to the vision server.
   * Requires the vision server endpoint to support this field.
   */
  instructions?: string;
};

export type CatImageGenKitten = {
  id: string;
  name: string;
  type: "image_gen";
  image_source: "original" | "previous_overlay";
  model_id: string;
  instructions: string;
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
  | CatImageGenKitten
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

