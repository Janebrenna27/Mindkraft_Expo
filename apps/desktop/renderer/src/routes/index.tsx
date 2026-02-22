import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ExamApp from "../features/exam/ExamApp";

const router = createBrowserRouter([
  { path: "/", element: <ExamApp /> },
  { path: "/exam", element: <ExamApp /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}