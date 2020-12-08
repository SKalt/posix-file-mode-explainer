const project = "posix-file-mode-explainer";
require("gh-pages").publish(
  `__sapper__/export/${project}`,
  {
    branch: "gh-pages",
    repo: `https://github.com/skalt/${project}.git`,
    user: {
      name: "Steven Kalt",
      email: "kalt.steven@gmail.com",
    },
  },
  () => console.log("Deploy Complete!")
);
