export type CatKittenType =
  | "model"
  | "vision_http"
  | "image_gen"
  | "sam3"
  | "gutter_custom_solution"
  | "transform_js"
  | "transform_py";

export type CatSam3Target = {
  name: string;
  prompts: string[];
};

export type CatSam3Kitten = {
  id: string;
  name: string;
  type: "sam3";
  image_source: "original" | "previous_overlay";
  targets: CatSam3Target[];
  run_all_targets?: boolean;
  mask_only?: boolean;
  test_image_storage_path?: string;
};

export type CatGutterCustomSolutionKitten = {
  id: string;
  name: string;
  type: "gutter_custom_solution";
  image_source: "original" | "previous_overlay";
  include_masks_base64?: boolean;
  include_overlay_image?: boolean;
  /** When true (default), Gemini designs the system first; SAM 3 segments the overlay. */
  use_gemini_overlay?: boolean;
  test_image_storage_path?: string;
};

export type CatModelKitten = {
  id: string;
  name: string;
  /**
   * Backwards compatible: legacy kittens omit `type` and are treated as `model`.
   */
  type?: "model";
  model_id: string;
  instructions: string;
  /** Optional: storage path for this kitten's test image override. */
  test_image_storage_path?: string;
};

export type CatVisionHttpKitten = {
  id: string;
  name: string;
  type: "vision_http";
  path: string;
  image_source: "original" | "previous_overlay";
  test_image_storage_path?: string;
  /**
   * Optional: request the vision endpoint to use a specific model.
   * Requires the endpoint to support this field.
   */
  model_id?: string;
  /**
   * Optional: pass extra instructions to the vision endpoint.
   * Requires the endpoint to support this field.
   */
  instructions?: string;
};

export type CatImageGenKitten = {
  id: string;
  name: string;
  type: "image_gen";
  image_source: "original" | "previous_overlay";
  model_id: string;
  /** Optional fallback model when primary fails (e.g. 429, 503). */
  fallback_model_id?: string;
  /** Optional system instruction (role, constraints). */
  system_instructions?: string;
  instructions: string;
  test_image_storage_path?: string;
};

export type CatTransformJsKitten = {
  id: string;
  name: string;
  type: "transform_js";
  code: string;
  test_image_storage_path?: string;
};

export type CatTransformPyKitten = {
  id: string;
  name: string;
  type: "transform_py";
  code: string;
  test_image_storage_path?: string;
};

export type CatKitten =
  | CatModelKitten
  | CatVisionHttpKitten
  | CatImageGenKitten
  | CatSam3Kitten
  | CatGutterCustomSolutionKitten
  | CatTransformJsKitten
  | CatTransformPyKitten;

export type CatRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  slug: string;
  kittens: CatKitten[];
  test_image_storage_path?: string;
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

