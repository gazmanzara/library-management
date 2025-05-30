import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layout.tsx", [
    index("routes/home/home.tsx"),
    route("/authors", "routes/authors/authors.tsx"),
    route("/categories", "routes/categories/categories.tsx"),
    route("/books", "routes/books/books.tsx"),
    route("/member", "routes/member/member.tsx"),
  ]),
] satisfies RouteConfig;
