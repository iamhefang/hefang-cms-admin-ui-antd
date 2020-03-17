import { Article } from "@/models/article";
import React from "react";

export default function ArticlePreviewModal(article: Article) {
  return <article>
    <h1>{article.title}</h1>
    <section>
      {article.content}
    </section>
  </article>
}
