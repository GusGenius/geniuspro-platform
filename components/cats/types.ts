export type CatKitten = {
  id: string;
  name: string;
  model_id: string;
  instructions: string;
};

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
  kittens: Array<Omit<CatKitten, "id">>;
};

