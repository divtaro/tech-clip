import { z } from "zod"

export const createArticleSchema = z.object({
  url: z.string().url("有効なURLを入力してください"),
  title: z.string().nullable(),
  description: z.string().nullable(),
  ogImage: z.string().nullable(),
  siteName: z.string().nullable(),
  status: z.enum(["TO_READ", "READING", "COMPLETED"]).default("TO_READ"),
  memo: z.string().nullable(),
})

export type CreateArticleInput = z.infer<typeof createArticleSchema>
