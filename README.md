# gpt-playground

This repository contains a basic static website structure.

## Contents

- `index.html` - The main HTML page.
- `css/style.css` - Styles for the website.
- `js/app.js` - Game logic with a simple computer opponent, win conditions,
  and increasing difficulty each round.
- `images/` - Placeholder directory for site images.

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) publishes the site to
GitHub Pages whenever changes are pushed to the `main` branch. After enabling
GitHub Pages in the repository settings, you can access the latest version of
the site from the URL reported in the workflow logs.
