export const isAuthenticated = () => {
  const token = window.localStorage.getItem("modernToken3") === null;
  return !!token;
};
export const withoutAuthRoutes = [
  "/",
  "/retro-game",
  "/modern-game",
  "/static/faq",
  "/pac-man/pacman",
  "/search",
  "/static/about",
  "/static/contact",
];
