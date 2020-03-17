import { Article } from "@/models/article";
import React from "react";

export default function ArticleSimpleBlock(props: Article) {
  return <div>
    <h2>{props.title}</h2>
    <p>{props.description}</p>
  </div>
}
