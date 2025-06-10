# gpt-playground

This repository contains a basic static website structure.

## Contents

- `index.html` - The main HTML page.
- `css/style.css` - Styles for the website and card layout.
- `js/app.js` - Game logic with a simple computer opponent, win conditions,
  increasing difficulty each round, and card descriptions.
- `images/` - Placeholder directory for site images.

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) publishes the site to
GitHub Pages whenever changes are pushed to the `main` branch. After enabling
GitHub Pages in the repository settings, you can access the latest version of
the site from the URL reported in the workflow logs.

## Updates

- Card descriptions appear in the market and directly on cards in your hand.
- Refreshed visuals with cleaner card layout, styled buttons, and highlighted
  game info boxes.
- Added simple emoji card art, a new Jester and Village card, and tweaked
  costs to reduce early gold rushes.
- Introduced a Militia attack card and mid-tier Duchy victory card.
- Adjusted costs for several cards to better balance play.
- The AI now gains Militia cards in later rounds, creating direct competition
  by reducing your available coins when it draws them.
- Expanded the card set to 50 medieval-themed cards featuring offense,
  defense and resource abilities.
- Added a defense stat that offsets attack damage and updated the market to
  include every card type each round.
